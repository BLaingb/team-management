# Instawork's Team Management
This project is done as part of Instawork's recruitment process. While the requirements specify an app with 3 pages (view team members, add team member, edit team member), I took some liberty around the requirements to get a more realistic use case (eg. When adding a team member, they'd need a way to sign up and access the app). The assumptions made are [listed below](#assumptions-made), along with a short description on why they were made and how they were accounted for.


## Stack

### Backend
Built on Django and Django Rest Framework.

### Frontend
Built on React, using Tanstack Router for routing, Tanstack Query for data fetching, and ShadCN for UI. Why Vite & Tanstack instead of something like NextJS? Two reasons for my choice:
1. Seems like an "internal app" use case, with no need for SEO optimizations and SSR/SSG features of larger frameworks, like Next/Remix/Nuxt/etc. A simple SPA with good routing seemed like a better fit.
1. I've been meaning to try Tanstack Router for a while, this just seemed like a good opportunity for it.

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
### Users can be members of more than one team
This assumption was made mainly to make the use case more realistic, as often team hierarchies and dynamics are more complex than only one team within a company, and for a given employee.

### New team members should be able to access the app
As the app specifies that only Admin users can delete members, I figured it implied Regular users (as well as other admins) should have access once added to a team. To solve this, I thought of a Team Invitation mechanism, were "Added" team members were instead invited, and had to sign up to become part of the team. This added quite a bit more work to the app, but again, results in a more realistic scenario.

### Only authenticated users can access the app
As the app is dealing with sensitive details (team members' contact details), I assumed authentication was required to view any data, and access to that data was dependent on the authenticated user's permissions and team membership. This was solved with custom permissions on Team Roles, along with a custom Permission Manager that would allow permissions to be scoped to a particular team. This was also the reason I didn't use Django's auth Groups, and implemented a Team Role model.

### Admins can edit only their team member's role
Given each team member has access to the app, and their own data, having admins updating another user's personal information didn't quite fit IMO. While this could not be the case, for the moment, it was solved by allowing the user to set up their details on signup, being pre-filled by the data on the invitation sent. In this scenario, Admins can still update other members' role for their team.

## TODO
- Permission management on FE
- Email sending on background workers
- Cron to invalidate/expire invitations
