# Cloudinary Unsigned Upload Setup

To enable video uploads, you need to create an unsigned upload preset in Cloudinary:

## Steps:

1. Go to your Cloudinary Dashboard: https://console.cloudinary.com/

2. Navigate to **Settings** → **Upload** (or go directly to: https://console.cloudinary.com/settings/upload)

3. Scroll down to **Upload presets** section

4. Click **Add upload preset**

5. Configure the preset:
   - **Preset name**: `hamza_portfolio_unsigned`
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: Leave empty (we'll specify it in the upload)
   - **Use filename**: Yes (optional)
   - **Unique filename**: Yes (recommended)
   - **Overwrite**: No
   - **Resource type**: Auto
   - **Access mode**: Public

6. Click **Save**

## Alternative: Use Existing Preset

If you already have an unsigned preset, update the preset name in:
`hamza-gaming-portfolio/app/api/cloudinary-signature/route.ts`

Change this line:
```typescript
uploadPreset: "hamza_portfolio_unsigned", // Change to your preset name
```

## Verify Setup

After creating the preset, try uploading a video asset through your dashboard. The upload should work without the 401 error.
