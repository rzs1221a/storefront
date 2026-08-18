/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_3D_TILES_KEY?: string;
  readonly VITE_USE_LIVE_LISTINGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
