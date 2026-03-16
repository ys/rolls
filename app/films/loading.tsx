import { ListItemSkeleton } from "@/components/Skeleton";

export default function FilmsLoading() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}
