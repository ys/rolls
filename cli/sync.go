package cli

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"sort"
	"strings"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v2"
)

func init() {
	// sync - copy roll frontmatter to Obsidian notes
	rootCmd.AddCommand(syncCmd)
	syncCmd.Flags().String("source", "", "Directory containing roll.md files (default: scans_path from config)")
	syncCmd.Flags().String("target", "", "Obsidian rolls directory (default: obsidian_rolls_path from config)")
	syncCmd.Flags().Bool("dry-run", false, "Show changes without modifying files")
}

// sync command
var syncCmd = &cobra.Command{
	Use:     "sync",
	Aliases: []string{"rolls:sync"},
	Short:   "Sync roll frontmatter into Obsidian notes",
	Args:    cobra.MatchAll(cobra.OnlyValidArgs),
	RunE: func(cmd *cobra.Command, args []string) error {
		sourceDir, err := cmd.Flags().GetString("source")
		cobra.CheckErr(err)
		targetDir, err := cmd.Flags().GetString("target")
		cobra.CheckErr(err)
		dryRun, err := cmd.Flags().GetBool("dry-run")
		cobra.CheckErr(err)

		if sourceDir == "" {
			sourceDir = cfg.ScansPath
		}
		if targetDir == "" {
			targetDir = cfg.ObsidianRollsPath
		}

		if sourceDir == "" {
			return errors.New("source directory is not set; pass --source or configure scans_path")
		}
		if targetDir == "" {
			return errors.New("target directory is not set; pass --target or configure obsidian_rolls_path")
		}

		return copyRollProperties(sourceDir, targetDir, dryRun)
	},
}

var rollNumberRegex = regexp.MustCompile(`^(\d{2}x\d{2,3})`)

func copyRollProperties(sourceDir, targetDir string, dryRun bool) error {
	fmt.Println(RenderTitle("🗒️", fmt.Sprintf("Copying roll properties from %s to %s", sourceDir, targetDir)))

	var rollFiles []string
	err := filepath.WalkDir(sourceDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		if d.Name() != "roll.md" {
			return nil
		}
		rollFiles = append(rollFiles, path)
		return nil
	})
	if err != nil {
		return err
	}

	fmt.Printf("Found %d roll.md files\n", len(rollFiles))

	processed := 0
	updated := 0
	notFound := 0

	for _, rollFile := range rollFiles {
		sourceContent, err := os.ReadFile(rollFile)
		if err != nil {
			fmt.Printf("Error reading %s: %v\n", rollFile, err)
			continue
		}

		sourceFrontmatter, _, err := extractYAMLFrontmatter(string(sourceContent))
		if err != nil {
			fmt.Printf("Error parsing frontmatter in %s: %v\n", rollFile, err)
			continue
		}
		if len(sourceFrontmatter) == 0 {
			fmt.Printf("No frontmatter found in %s\n", rollFile)
			continue
		}

		rollNumber := ""
		if rn, ok := sourceFrontmatter["roll_number"].(string); ok {
			rollNumber = strings.TrimSpace(rn)
		}
		if rollNumber == "" {
			folderName := filepath.Base(filepath.Dir(rollFile))
			rollNumber = getRollNumberFromFolder(folderName)
		}
		if rollNumber == "" {
			fmt.Printf("Could not determine roll number for %s\n", rollFile)
			continue
		}

		targetFile, err := findTargetFile(targetDir, rollNumber)
		if err != nil {
			fmt.Printf("Error searching target for roll %s: %v\n", rollNumber, err)
			continue
		}
		if targetFile == "" {
			if !dryRun || notFound < 10 {
				fmt.Printf("Target file not found for roll %s\n", rollNumber)
			}
			notFound++
			continue
		}

		ok, err := updateTargetFrontmatter(targetFile, sourceFrontmatter, dryRun)
		if err != nil {
			fmt.Printf("Failed to update %s: %v\n", targetFile, err)
			continue
		}
		if ok && !dryRun {
			fmt.Printf("Updated %s with properties from %s\n", targetFile, rollFile)
		}
		updated++
		processed++
	}

	fmt.Printf("\nSummary:\n")
	fmt.Printf("  Processed: %d\n", processed)
	if dryRun {
		fmt.Printf("  Would update: %d\n", updated)
	} else {
		fmt.Printf("  Updated: %d\n", updated)
	}
	fmt.Printf("  Target files not found: %d\n", notFound)

	return nil
}

func extractYAMLFrontmatter(content string) (map[string]interface{}, string, error) {
	if !strings.HasPrefix(content, "---") {
		return nil, content, nil
	}

	parts := strings.SplitN(content, "---", 3)
	if len(parts) < 3 {
		return nil, content, fmt.Errorf("invalid markdown: missing closing frontmatter")
	}

	frontmatterText := strings.TrimSpace(parts[1])
	body := parts[2]

	if frontmatterText == "" {
		return map[string]interface{}{}, body, nil
	}

	frontmatter := make(map[string]interface{})
	if err := yaml.Unmarshal([]byte(frontmatterText), &frontmatter); err != nil {
		return nil, content, err
	}

	return frontmatter, body, nil
}

func mergeFrontmatter(source, target map[string]interface{}) map[string]interface{} {
	merged := make(map[string]interface{}, len(target))
	for k, v := range target {
		merged[k] = v
	}

	for k, v := range source {
		existing, ok := merged[k]
		if !ok || isEmptyValue(existing) {
			merged[k] = v
			continue
		}

		if list, ok := existing.([]interface{}); ok && len(list) == 0 {
			merged[k] = v
		}
		if list, ok := existing.([]string); ok && len(list) == 0 {
			merged[k] = v
		}
	}

	return merged
}

func isEmptyValue(v interface{}) bool {
	switch val := v.(type) {
	case nil:
		return true
	case string:
		return strings.TrimSpace(val) == ""
	case []interface{}:
		return len(val) == 0
	case []string:
		return len(val) == 0
	}
	return false
}

func findTargetFile(targetDir, rollNumber string) (string, error) {
	searchPaths := []string{targetDir}

	entries, err := os.ReadDir(targetDir)
	if err != nil {
		return "", err
	}

	for _, entry := range entries {
		if entry.IsDir() && isNumeric(entry.Name()) {
			searchPaths = append(searchPaths, filepath.Join(targetDir, entry.Name()))
		}
	}

	pattern := fmt.Sprintf("%s*.md", rollNumber)
	for _, searchPath := range searchPaths {
		matches, err := filepath.Glob(filepath.Join(searchPath, pattern))
		if err != nil {
			return "", err
		}
		for _, match := range matches {
			info, err := os.Stat(match)
			if err == nil && info.Mode().IsRegular() {
				return match, nil
			}
		}
	}

	return "", nil
}

func isNumeric(value string) bool {
	for _, r := range value {
		if r < '0' || r > '9' {
			return false
		}
	}
	return value != ""
}

func getRollNumberFromFolder(folderName string) string {
	match := rollNumberRegex.FindStringSubmatch(folderName)
	if len(match) == 2 {
		return match[1]
	}
	return ""
}

func updateTargetFrontmatter(targetPath string, sourceFrontmatter map[string]interface{}, dryRun bool) (bool, error) {
	content, err := os.ReadFile(targetPath)
	if err != nil {
		return false, err
	}

	targetFrontmatter, body, err := extractYAMLFrontmatter(string(content))
	if err != nil || targetFrontmatter == nil {
		targetFrontmatter = map[string]interface{}{}
		body = string(content)
	}

	mergedFrontmatter := mergeFrontmatter(sourceFrontmatter, targetFrontmatter)
	hasChanges := !reflect.DeepEqual(mergedFrontmatter, targetFrontmatter)

	if !hasChanges {
		if !dryRun {
			fmt.Printf("No changes needed for %s\n", targetPath)
		}
		return true, nil
	}

	if dryRun {
		fmt.Printf("[DRY RUN] Would update %s\n", targetPath)
		fmt.Printf("  Current frontmatter keys: %s\n", formatKeys(targetFrontmatter))
		fmt.Printf("  Merged frontmatter keys: %s\n", formatKeys(mergedFrontmatter))

		added := make([]string, 0)
		changed := make([]string, 0)
		for k := range mergedFrontmatter {
			_, existed := targetFrontmatter[k]
			if !existed {
				added = append(added, k)
				continue
			}
			if !reflect.DeepEqual(mergedFrontmatter[k], targetFrontmatter[k]) {
				changed = append(changed, k)
			}
		}

		if len(added) > 0 {
			sort.Strings(added)
			fmt.Printf("  Would add keys: %s\n", strings.Join(added, ", "))
		}
		if len(changed) > 0 {
			sort.Strings(changed)
			fmt.Printf("  Would change keys: %s\n", strings.Join(changed, ", "))
		}
		return true, nil
	}

	yamlContent, err := yaml.Marshal(mergedFrontmatter)
	if err != nil {
		return false, err
	}

	newContent := fmt.Sprintf("---\n%s---%s", string(yamlContent), body)
	if err := os.WriteFile(targetPath, []byte(newContent), 0644); err != nil {
		return false, err
	}

	return true, nil
}

func formatKeys(m map[string]interface{}) string {
	if len(m) == 0 {
		return "[]"
	}
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return fmt.Sprintf("[%s]", strings.Join(keys, ", "))
}
