# Digital Closet

A wardrobe manager app for organizing your clothes

## Overview

The app is about organizing your clothes in a easy way, you can add an item, name it, set a brand name, category and upload the item's image(s)...
also you can build outfits from the available items you have added.

the app is for people who struggle managing their closet and building outfits, to avoid closet chaos

## Features

- Add items with season, colors, tags, images
- Organize items into categories
- Build outfits from saved items
- Secure authentication and protected user data

## Tech Stack

- Next.js (App Router)
- TypeScript
- Better-Auth
- PostgreSQL
- AWS S3 (image storage)
- Tailwind CSS
- Zod (schema validation)

## Database Design

- categories ↔ items (one-to-many)
- items ↔ tags (many-to-many)
- outfits ↔ items (many-to-many)

## Local Setup

**Requirements**

- Docker
- Docker Compose
- AWS S3 Bucket

**Environment Variables**

- BETTER_AUTH_SECRET
- RESEND_API_KEY
- AWS_S3_BUCKET_NAME
- AWS_S3_ACCESS_KEY
- AWS_S3_SECRET_KEY

**Run**

```bash
docker compose up --build
```

## Screenshots

### Closet Overview

<img src="./screenshots/home.png" alt="Closet Overview" width=800 >

### Item Details

<img src="./screenshots/item.png" alt="Item Details" width=800 >

### Add New Item

<img src="./screenshots/newItem.png" alt="Create New Item" width=800 >

### Outfits

<img src="./screenshots/outfits.png" alt="Outfits" width=800 >

### Outfit Details

<img src="./screenshots/outfit.png" alt="Outfit" width=800 >

### Create New Outfit

<img src="./screenshots/createOutfit.png" alt="Create New Outfit" width=800 >

### Settings

<img src="./screenshots/settings.png" alt="Settings" width=800 >
