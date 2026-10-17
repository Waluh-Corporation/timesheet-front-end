# Git Workflow & Versioning Standard Operating Procedure (SOP)

Dokumen ini mendefinisikan standar alur kerja Git, strategi branching, konvensi commit, dan prosedur rilis untuk repositori **Timesheet Portal Frontend**. Standar ini diselaraskan dengan arsitektur backend untuk menjamin konsistensi, keterlacakan, dan integrasi berkesinambungan (CI/CD) yang aman dan reliabel.

---

## 1. Branching Model (Dual-Trunk / GitFlow Ringkas)

Repositori ini menggunakan model **Dual-Branch** yang berorientasi pada stabilitas produksi dan integrasi fitur yang cepat:

```
[main] ──────────────────────────●──────────────● (Tagged v0.7.1) ────────● (Tagged v0.8.0)
                                 │              ▲                         ▲
                                 │              │ (PR Merge)              │ (PR Merge)
                                 │              └──── [release/v0.7.1]    └─── [release/v0.8.0]
                                 │ (Auto-sync)                                 ▲
                                 ▼                                             │
[development] ───●───────────────●──────────────────●──────────────────────────┘
                  ╲                                ╱
                   ●─────────●────────────────────╱ (PR Merge)
                   [feat/berita-acara-and-user-anonymization]
```

### Cabang Utama (Long-Lived Branches)

| Branch | Tujuan & Kebijakan |
|---|---|
| `main` | **Cabang Produksi (Production)**. Selalu berada dalam kondisi siap deploy (*production-ready*). Tidak boleh menerima direct commit (harus melalui Pull Request yang disetujui). Semua rilis resmi ditandai (*tagged*) di branch ini. |
| `development` | **Cabang Integrasi (Active Integration)**. Tempat berkumpulnya seluruh fitur dan perbaikan yang sedang dikembangkan. Menjadi target dasar (*base branch*) untuk semua Pull Request fitur/bugfix. |

### Cabang Pendukung (Short-Lived Branches)

| Prefiks Branch | Contoh | Sumber Branch | Target Merge |
|---|---|---|---|
| `feat/*` | `feat/berita-acara-and-user-anonymization` | `development` | `development` |
| `fix/*` | `fix/company-assignment-guard` | `development` | `development` |
| `chore/*` | `chore/update-dependencies` | `development` | `development` |
| `release/v*.*.*` | `release/v0.8.0` | `development` | `main` |
| `sync/main-to-development-*` | `sync/main-to-development-36292682390` | `main` (Otomatis oleh CI) | `development` |

---

## 2. Standar Commit (Conventional Commits)

Format pesan commit wajib mematuhi spesifikasi [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Daftar Commit Types:
- `feat`: Penambahan fitur baru (meningkatkan versi **MINOR**).
- `fix`: Perbaikan bug atau penanganan kesalahan (meningkatkan versi **PATCH**).
- `docs`: Perubahan dokumentasi saja (seperti README, panduan, atau komentar kode).
- `style`: Pemformatan, spasi, semi-kolon tanpa mengubah logika kode.
- `refactor`: Restrukturisasi kode tanpa mengubah fungsionalitas eksternal.
- `perf`: Optimasi performa render atau eksekusi runtime.
- `test`: Penambahan atau pembaruan pengujian unit/integrasi.
- `build`: Pembaruan konfigurasi bundler, dependencies, atau package.json.
- `ci`: Perubahan workflow GitHub Actions atau skrip pipeline.
- `chore`: Tugas pemeliharaan umum yang tidak mengubah kode aplikasi.
- `revert`: Membatalkan commit sebelumnya.

### Aturan Penulisan Judul (PR & Commit):
1. Menggunakan kalimat imperatif dan huruf kecil setelah tanda titik dua (contoh: `feat: integrate berita acara flow`, bukan `feat: Added berita acara`).
2. Jangan menggunakan huruf kapital di awal deskripsi subjek (divalidasi otomatis oleh `semantic-pr.yml`).
3. Hindari pesan ambigu seperti `fix`, `update`, `wip`, atau `coba`.

---

## 3. Gerbang Kualitas Lokal (Local Quality Gates)

Sebelum membuat commit atau membuka Pull Request, seluruh pengujian dan pengecekan tipe harus dipastikan lolos secara lokal:

```bash
# 1. Validasi tipe data TypeScript
bun run typecheck

# 2. Jalankan test suite dengan mode isolate
bun test

# 3. Jalankan test coverage
bun run test:coverage

# 4. Verifikasi kompilasi build produksi Next.js
bun run build
```

---

## 4. Gerbang Kualitas Otomatis (CI / GitHub Actions)

Repositori ini dilindungi oleh workflow otomatis:
1. **Secret Leak Detection (Gitleaks)**: Memindai kebocoran token/kredensial di seluruh commit history.
2. **Typecheck & Static Build**: Memverifikasi kompilasi TypeScript dan Next.js static output.
3. **SonarQube Quality Analysis**: Menganalisis kualitas kode, maintainability, duplikasi, dan cakupan test.
4. **Semantic Pull Request Title**: Memastikan judul PR mematuhi spesifikasi Conventional Commits.

---

## 5. Prosedur Rilis & Semantic Versioning (SemVer)

Repositori ini mematuhi format [Semantic Versioning 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`:
- **MAJOR**: Terdapat *breaking changes* pada antarmuka atau kontrak sistem.
- **MINOR**: Penambahan fitur baru yang bersifat *backward-compatible*.
- **PATCH**: Perbaikan bug atau penyesuaian non-breaking.

### Langkah-langkah Mempersiapkan Rilis:

1. **Buat Cabang Rilis dari `development`**:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b release/vX.Y.Z
   ```

2. **Perbarui Versi & Changelog**:
   - Ubah atribut `"version": "X.Y.Z"` pada file [package.json](file:///c:/Users/afais/GitHub/timesheet-front-end/package.json).
   - Perbarui [CHANGELOG.md](file:///c:/Users/afais/GitHub/timesheet-front-end/CHANGELOG.md) dengan menambahkan header versi baru:
     ```markdown
     ## [X.Y.Z] - YYYY-MM-DD
     ### Added
     - ...
     ### Changed
     - ...
     ### Fixed
     - ...
     ```

3. **Commit dan Buka Pull Request ke `main`**:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore(release): prepare vX.Y.Z release notes"
   git push origin release/vX.Y.Z
   ```
   Buka PR dengan base `main` dan head `release/vX.Y.Z`.

4. **Tagging dan Publikasi Otomatis**:
   Setelah PR di-merge ke `main`, buat tag rilis:
   ```bash
   git checkout main
   git pull origin main
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin vX.Y.Z
   ```
   Tag ini akan secara otomatis memicu:
   - `release.yml`: Menerbitkan rilis GitHub dan mengunggah image container ke GitHub Container Registry (`ghcr.io`).
   - `sync-main-to-development.yml`: Menyinkronkan perubahan dari `main` kembali ke `development`.
