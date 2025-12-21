# GTA Garage Dashboard

Internal web dashboard for workshop management (stok, transaksi, unit servis, laporan, keuntungan).

## Recent Updates

- Smoothed global UI motion for dialogs, dropdowns, popovers, sheets, and tabs with slower easing.
- Aligned modal animations across pages (add/edit/view/delete/update status).
- Improved dropdown active-state contrast for clearer selection.
- Prevented mobile auto-keyboard on "Tambah Barang Baru" by disabling auto-focus.
- Adjusted unit table actions to use icon-only buttons and better layout spacing.
- Added section entrance animations on the Keuntungan page for a smoother flow.

## Run Locally

1. Install dependencies (use one of):
   - `npm install`
   - `pnpm install`
2. Start dev server:
   - `npm run dev`
   - `pnpm dev`

## Notes

- Animations are driven by global motion tokens in `app/globals.css`.
- Shared UI primitives live in `components/ui/` and carry the motion styles.
