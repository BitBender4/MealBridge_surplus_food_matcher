# Surplus Food Matcher

> Built for **Vibe Coding Event 2026 — Day 2 (30th)**
> **Problem Statement #5:** Surplus Food Matcher
> **Target Persona:** Food Donors (Wedding Halls / Caterers) & Shelter/NGO Coordinators

## Problem & Solution

Surplus cooked food from weddings, restaurants, caterers, and events can go to waste because donors and nearby NGOs often do not have enough time to coordinate a pickup.

**MealBridge** solves this by allowing a donor to describe available surplus food in a simple natural-language message. The system extracts important information, identifies missing details, creates a structured donation listing, and matches it with suitable nearby recipients.

The goal is to reduce the communication and coordination delay between food donors and organizations that can redistribute the food.

### Constraint Addressed

Cooked food is time-sensitive, so coordination needs to happen quickly.

MealBridge focuses on fast donor input, structured information, recipient matching, and pickup coordination so that available surplus food can be acted on within the available coordination window.

## Core AI Architecture

- **Model / Service:** Gemini / LLM-based Natural Language Extraction
- **Workflow:** Donor enters a quick natural-language description → AI extracts donation details → missing or unclear information is identified → donor confirms the information → matching system evaluates suitable NGOs based on distance, capacity, dietary compatibility, and pickup availability → recipient accepts the donation → pickup is coordinated and tracked.
- **Error Handling:** If important information is missing or unclear, the system asks the donor to confirm or provide the required details instead of silently guessing. Extracted information can also be reviewed and corrected before matching.

## Key Features

- Natural-language donation input
- AI-assisted information extraction
- Missing-information detection
- Donation confirmation
- Recipient matching
- Distance and capacity-based matching
- Dietary compatibility
- Pickup coordination
- Donation status tracking
- End-to-end donor-to-recipient workflow

## Responsible AI

AI is used to improve communication and coordination, not to make final food-safety decisions.

The system extracts and organizes information provided by the donor and highlights missing or unclear details for human confirmation.

## Prerequisites & Installation

```bash
# 1. Clone repository
git clone https://github.com/BitBender4/mealbridge-surplus-food-matcher.git

# 2. Enter project directory
cd mealbridge-surplus-food-matcher

# 3. Install dependencies
npm install

# 4. Environment variables
# Add the required API keys to your environment file
# Example:
# API_KEY=your_key_here

# 5. Run development server
npm run dev


Donor Message
      ↓
AI Information Extraction
      ↓
Confirm Donation
      ↓
Find Suitable NGO
      ↓
Recipient Accepts
      ↓
Pickup Coordination
      ↓
Donation Completed


# Participant Info
Name: Bhumi Prakash Dahivalkar

College ID: 57604260019

Day: Day 2 (30th)# MealBridge_surplus_food_matcher
