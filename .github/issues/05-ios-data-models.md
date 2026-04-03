---
title: "iOS: Swift data models (Roll, Camera, Film)"
labels: enhancement, ios
---

`Codable` Swift structs that decode from the existing JSON API responses, plus `@Observable` stores.

## Structs

### Roll
```swift
struct Roll: Codable, Identifiable {
    let uuid: String
    var id: String { uuid }
    let rollNumber: String
    var cameraUuid: String?
    var filmUuid: String?
    var shotAt: Date?
    var fridgeAt: Date?
    var labAt: Date?
    var labName: String?
    var scannedAt: Date?
    var processedAt: Date?
    var uploadedAt: Date?
    var archivedAt: Date?
    var albumName: String?
    var tags: [String]?
    var notes: String?
    var contactSheetUrl: String?
    var pushPull: Int?
    var updatedAt: Date
}
```

### RollStatus (computed)
```swift
enum RollStatus { case fridge, loaded, lab, scanned, processed, uploaded, archived }
// mirrors CLI: archived > uploaded > processed > scanned > lab > fridge > loaded
```

### Camera
`uuid`, `slug`, `brand`, `model`, `nickname?`, `format` (default 135)

### Film
`uuid`, `slug`, `brand`, `name`, `nickname?`, `iso?`, `color`, `showIso`

## Tasks

- [ ] Define all structs with `JSONDecoder.KeyDecodingStrategy.convertFromSnakeCase`
- [ ] `RollStatus` computed var from timestamps
- [ ] `@Observable RollStore` — holds `[Roll]`, exposes CRUD, calls `APIClient`
- [ ] `@Observable CameraStore` — holds `[Camera]`, CRUD
- [ ] `@Observable FilmStore` — holds `[Film]`, CRUD
- [ ] Stores load from local cache on init, fetch from API in background
- [ ] All mutations `@MainActor` to update UI safely
