# 🏋️ MiMoFit
> AI Fitness Planner & Calorie Calculator — powered by Xiaomi MiMo V2.5

🔗 [Live Demo](https://gyoomei.github.io/mimofit/) · 📂 [Repo](https://github.com/gyoomei/mimofit)

## What it does

MiMoFit is an AI-powered fitness companion that helps you calculate your ideal nutrition, analyze food photos, generate workout plans, and track your gym progress.

```
You paste:    Body metrics (height, weight, age, activity)
MiMo replies: Personalized BMI, TDEE, BMR, and macro targets

You paste:    Food photo
MiMo replies: Calorie estimate + nutritional analysis + health tips

You select:   Fitness goal + equipment + experience level
MiMo replies: Structured workout plan with sets, reps, and rest periods
```

## Features

| Capability | Detail |
|---|---|
| BMI Calculator | Mifflin-St Jeor formula with visual gauge |
| TDEE Engine | Activity-adjusted calorie needs with goal modifier |
| Macro Split | Protein, fat, carbs based on goal (cut/maintain/bulk) |
| Food Analyzer | Canvas color analysis + MiMo nutritional breakdown |
| Workout Generator | AI-structured split (Push/Pull/Legs) via MiMo |
| Progress Tracker | Log workouts, auto 1RM estimation (Epley formula) |
| Chat with MiMo | Floating chat for fitness advice (nutrition, recovery, supplements) |
| Theme Toggle | Dark/light mode with localStorage persistence |
| Responsive | Mobile-first, works on 320px to 1440px+ |

## How it works

```
┌─────────────────────────────────────────────────┐
│  Browser (Single HTML + JS)                     │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ BMI/TDEE │  │  Canvas  │  │  Workout     │  │
│  │ Calculator│  │  Image   │  │  Generator   │  │
│  │ (local)  │  │ Analysis │  │  (MiMo AI)   │  │
│  └──────────┘  └────┬─────┘  └──────┬───────┘  │
│                      │               │           │
│                      ▼               ▼           │
│              ┌───────────────────────────┐       │
│              │   Pollinations.ai API     │       │
│              │   (MiMo V2.5, free)       │       │
│              └───────────────────────────┘       │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  localStorage (progress, theme, prefs)   │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Try it

1. Open [gyoomei.github.io/mimofit](https://gyoomei.github.io/mimofit/)
2. Enter your body metrics → click **Calculate**
3. Upload a food photo → get calorie estimate
4. Select workout preferences → click **Generate Plan**
5. Log your gym progress → track 1RM over time
6. Click the 💬 chat button → ask MiMo about fitness

## Stack

- **Frontend:** Single HTML + vanilla JS (~47KB total)
- **AI:** Xiaomi MiMo V2.5 via Pollinations.ai (free, no API key)
- **Food Analysis:** Canvas-based color/texture heuristic + MiMo narrative
- **Data:** localStorage for persistence
- **Hosting:** GitHub Pages (free)

## Architecture decisions

- **Single HTML** — zero build step, zero dependencies, bulletproof deploy
- **Canvas analysis** — Pollinations.ai has no vision support, so food photos are analyzed client-side for color composition, then MiMo provides nutritional context based on the analysis
- **Pollinations.ai** — free gateway to MiMo V2.5, no API key required
- **localStorage** — progress tracking without backend, survives page refreshes

## Roadmap

- [ ] Water intake tracker
- [ ] Sleep quality analyzer
- [ ] Meal plan generator (weekly)
- [ ] Exercise video demonstrations
- [ ] Export progress to CSV/PDF

## Run locally

```bash
git clone https://github.com/gyoomei/mimofit.git
cd mimofit
python3 -m http.server 8080
# Open http://localhost:8080
```

## License

MIT

---

**Built with 🧠 Xiaomi MiMo V2.5 · Submitted to MiMo 100T**
