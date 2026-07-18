# Zarshan Admin Dashboard

Fully wired to the Backend admin APIs.

## Run

```bash
cd AdminDashboard
npm install
npm run dev
```

- Admin: http://localhost:3001
- Backend: http://localhost:8000

Login with a user whose role is `admin` or `superadmin`.

## Wired modules

| Page | Backend |
|------|---------|
| Dashboard | `GET /admin/dashboard/overview` |
| Users | list / suspend / verify / reset password / delete |
| User Activity | `GET /admin/users/activity` |
| Workspaces | list / suspend / delete |
| Posts | list by status / delete |
| Social Accounts | manage + dataset + token refresh |
| Scheduler | status + manual run |
| Analytics | charts (30d) |
| Subscriptions | plans + plan change |
| Payments | history + summary |
| AI Management | OpenAI connection status |
| Media Library | list / delete |
| Notifications | history + broadcast |
| Support | tickets + resolve |
| Blogs | create / publish / delete |
| Reports | overview + CSV export |
| Audit Logs | filtered logs |
| API Settings | integration status |
| System Settings | platform settings + security + monitoring |
