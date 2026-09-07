# Asset Catalog & Directory Structure

This document outlines the organization of assets used across the Zoom Clone frontend so that team members can easily identify which assets belong to which UI section and component.

## Directory Layout

```
public/assets/
├── auth/                                  # Assets for Authentication Flows
│   ├── zoomtopia.jpg                      # Sign In page: Zoomtopia 3D blue glossy ribbon promotional banner
│   └── signup_illustration.jpg            # Sign Up page: Coworkers assembling video tiles on monitor
└── landing/
    └── carousel/                          # Assets for the Hero Product Carousel
        ├── phone.jpg                      # Phone Card: User with glasses talking on mobile
        ├── webinars.jpg                   # Webinars Card: Keynote speaker on stage with emojis
        ├── bonsai.webp                    # Bonsai Card: Clients list (ACME, Aperture) & action menu
        ├── rooms.jpg                      # Rooms Card: Executive conference room with Zoom Room display
        ├── brighthire.webp                # BrightHire Card: AI Interview Assistant question & review
        ├── virtual-agent.jpg              # Virtual Agent Card: Mobile user with "How can I assist you?"
        ├── contact-center.jpg             # Contact Center Card: Smiling agent with headset
        ├── workvivo.webp                  # Workvivo Card: Employee engagement feed & dashboard
        ├── ai-suite.webp                  # AI Productivity Suite Card: Creative slides proposal
        └── zoom-mate.webp                 # ZoomMate Card: Meeting analysis template prompt
```

## Section-by-Section Mapping

### Authentication (`/signin`, `/signup`)
| Asset File | Component | UI Purpose |
| :--- | :--- | :--- |
| `zoomtopia.jpg` | `signin/page.tsx` | Left-side banner showing 3D glossy blue ribbon for Zoomtopia 2026 registration |
| `signup_illustration.jpg` | `signup/page.tsx` | Top-left flat illustration of coworkers assembling participant video screens |

### Landing Page (`/`)
| Asset File | Component | UI Purpose |
| :--- | :--- | :--- |
| `phone.jpg` | `ProductCarousel.tsx` | Visual card for Zoom Phone enterprise VoIP calling |
| `webinars.jpg` | `ProductCarousel.tsx` | Visual card for Zoom Webinars & Virtual Events |
| `bonsai.webp` | `ProductCarousel.tsx` | Visual card for Bonsai client management & contract workflows |
| `rooms.jpg` | `ProductCarousel.tsx` | Visual card for Zoom Rooms conference hardware systems |
| `brighthire.webp` | `ProductCarousel.tsx` | Visual card for BrightHire AI interview intelligence |
| `virtual-agent.jpg` | `ProductCarousel.tsx` | Visual card for Zoom Virtual Agent conversational AI |
| `contact-center.jpg` | `ProductCarousel.tsx` | Visual card for Zoom Contact Center omnichannel support |
| `workvivo.webp` | `ProductCarousel.tsx` | Visual card for Workvivo employee engagement platform |
| `ai-suite.webp` | `ProductCarousel.tsx` | Visual card for AI Productivity Suite presentation tools |
| `zoom-mate.webp` | `ProductCarousel.tsx` | Visual card for ZoomMate meeting analysis & automation |
