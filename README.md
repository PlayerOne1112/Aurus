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
- **Helvetica Neue** Regular is vendored in `fonts/helvetica-neue-regular.ttf` and used for body text.
