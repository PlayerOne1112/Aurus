# AURUS — landing page

Static slice of the AURUS presale landing page: site header and hero, taken from the Figma frame **Главная** (`54:3731`) in **Aurus-Presale**.

This step is the header and the first screen only. Sections below the hero are not included.

## Run

From the repository root:

```bash
npx --yes serve -l tcp://0.0.0.0:43123 .
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

No build step. Fonts, images, and scripts are local.

## Fonts

- **Forum** Regular is vendored in `fonts/` (the heading face from the file).
- **Helvetica Neue** is the body face from the file. It is not on Google Fonts. The page uses it when the system has it, and otherwise **Inter** from Google Fonts.
