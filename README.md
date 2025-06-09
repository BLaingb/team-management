# Instawork's Team Management

## Stack

### Backend
Built on Django and Django Rest Framework.
### Frontend
Built on React, using Tanstack Router for routing, Tanstack Query for data fetching, and ShadCN for UI.

## Running Locally
### Backend
Easiest way to get backend running is using VsCode DevContainers, also available on cursor. Just `code team-management-api` and `CMD+Shift+P / Ctrl+Shift+P` and select `Dev Containers: Reopen in container`.
Once in the container, run:
```bash
cp .env.example .env.dev
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```
You should be able to access the app on http://localhost:8000/admin
### Frontend
Open `team-management-web`, and install dependencies using pnpm, `pnpm install`.
Once dependencies are installed, run:
```bash
cp .env.example .env
pnpm start
```

## Assumptions Made
- Users can be members of more than one team
- New team members should be able to access the app
- Only authenticated users can access the app
- Admins can edit their team member's information

## TODO
- Accept/Reject invites
- Edit team members
- When creating a team, automatically set the current user as a member with Admin role
- Email sending on background workers
