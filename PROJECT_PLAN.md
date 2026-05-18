# 4VISO Project Execution Plan

This is the shared roadmap for the team. Tasks are ordered by product logic, not by repository ownership. Each task should be small enough for one focused commit or one small pull request.

## 1. Working Rules

1. Pull `main` before starting work.
2. Keep frontend and backend changes in their own repositories.
3. Do not commit `.env`, passwords, local logs, or database credentials.
4. Keep commits small and easy to review.
5. Run a build or smoke check before pushing.
6. Finish backend API shape before wiring the matching frontend screen.
7. Keep UI text clean and avoid temporary internal notes in the product.

## 2. Environment Setup

1. Confirm everyone has Node.js `^20.19.0` or `>=22.12.0`.
2. Clone `4VISO_Backend`.
3. Clone `4VISO_Frontend`.
4. Run `npm install` in both repositories.
5. Create `backend/.env` locally.
6. Add `PORT=3000` to `backend/.env`.
7. Add the MongoDB Atlas `MONGO_URI` to `backend/.env`.
8. Confirm `backend/.env` is ignored by Git.
9. Confirm frontend builds with `npm run build`.
10. Confirm backend starts with `npm start`.

## 3. MongoDB Setup

1. Use MongoDB Atlas for the shared team database.
2. Use AWS Frankfurt `eu-central-1` for the cluster.
3. Use database name `4viso-dev`.
4. Create one backend application database user.
5. Create separate database users for teammates if they need Compass access.
6. Add each teammate's IP address in Atlas `Network Access`.
7. Invite teammates in Atlas `Project Access` if they need to manage the project.
8. Use `readWrite` permissions for development database users.
9. Do not use temporary users for normal development.
10. Do not preload sample datasets.
11. Verify connection with a MongoDB ping.
12. Insert one demo lane document to verify the database is visible.

## 4. Backend Foundation

1. Add `.env.example`.
2. Add MongoDB setup documentation.
3. Add `GET /health`.
4. Improve startup logs.
5. Improve MongoDB connection error message.
6. Add folder structure for `models`, `controllers`, `routes`, `middleware`, and `utils`.
7. Keep existing auth route working during refactoring.
8. Add a 404 handler.
9. Add a global error handler.
10. Add smoke test instructions to README.

## 5. Authentication

1. Create `User` model.
2. Add fields: `name`, `email`, `passwordHash`, `role`, `companyName`.
3. Add timestamps.
4. Add unique email validation.
5. Add password hashing.
6. Replace mock register with database-backed register.
7. Replace mock login with database-backed login.
8. Add JWT token generation.
9. Add auth middleware.
10. Add `GET /auth/me`.
11. Connect frontend `Login.vue` to backend.
12. Connect frontend `Register.vue` to backend.
13. Store token in localStorage.
14. Add logout.
15. Protect private frontend routes.

## 6. Lane Model

1. Create `Lane` model.
2. Add owner user/company.
3. Add lane status: `draft`, `pending`, `live`, `archived`.
4. Add origin and destination.
5. Add cargo profile.
6. Add route nodes.
7. Add backup nodes.
8. Add risk level.
9. Add certificates.
10. Add alerts.
11. Add report metadata.
12. Add timestamps.

## 7. Lane API

1. Add `POST /lanes`.
2. Add `GET /lanes`.
3. Add `GET /lanes/:id`.
4. Add `PUT /lanes/:id`.
5. Add archive or delete endpoint.
6. Protect lane routes with auth middleware.
7. Return only lanes available to the current user's company.
8. Allow admins to see all lanes.
9. Validate create payload.
10. Validate update payload.
11. Test all endpoints with Postman or Thunder Client.

## 8. Frontend Lane List

1. Review current `Lanes.vue`.
2. Replace static data with backend API data.
3. Keep `lanes.json` only as demo fallback if needed.
4. Add loading state.
5. Add empty state.
6. Add error state.
7. Add search.
8. Add status filter.
9. Add risk filter.
10. Open the selected lane from a card.

## 9. Create Lane Flow

1. Review current `CreateRoute.vue`.
2. Fix broken encoding symbols.
3. Keep the form short and clear.
4. Collect product type.
5. Collect dimensions.
6. Collect weight.
7. Collect quantity.
8. Collect temperature range.
9. Collect special handling.
10. Collect certificates.
11. Collect origin.
12. Collect destination.
13. Validate required fields.
14. Save draft lane to backend.
15. Continue to route canvas using lane ID.

## 10. Route Canvas

1. Review current `RouteCanvas.vue`.
2. Load lane by ID.
3. Display origin node.
4. Display destination node.
5. Add intermediary nodes.
6. Edit node location.
7. Edit node company.
8. Edit transport type.
9. Add backup nodes.
10. Remove backup nodes.
11. Save node changes to backend.
12. Show save status.
13. Prevent accidental data loss.
14. Confirm route persists after refresh.

## 11. Risk And Compliance

1. Define simple risk rules for MVP.
2. Calculate lane risk from cargo and route data.
3. Calculate node risk.
4. Display risk on lane cards.
5. Display risk on canvas nodes.
6. Store required certificates.
7. Store active alerts.
8. Show alerts in lane details.
9. Keep advanced risk scoring for later.

## 12. Reports

1. Add report status to lane.
2. Add `not_generated`, `pending`, and `live`.
3. Add generate report endpoint.
4. Add generate report button.
5. Move lane to `pending` after report generation.
6. Add approval action for admin/auditor.
7. Move lane to `live` after approval.
8. Add report preview.
9. Add download only if core flow is finished.

## 13. Settings And Notifications

1. Review `Settings.vue`.
2. Keep settings simple for MVP.
3. Add profile/company fields if needed.
4. Review `Notifications.vue`.
5. Connect notifications to lane alerts if time allows.
6. Keep mock notifications only if backend is not ready.

## 14. UI Polish

1. Fix all broken encoding text such as `â†’`, `Â°C`, and broken emoji output.
2. Standardize buttons.
3. Standardize form fields.
4. Standardize page spacing.
5. Standardize empty states.
6. Standardize loading states.
7. Make desktop layouts clean.
8. Make tablet layouts acceptable.
9. Remove temporary explanatory UI copy.
10. Check login, register, dashboard, lanes, create route, and route canvas as one flow.

## 15. Testing And Demo

1. Test backend startup.
2. Test MongoDB connection.
3. Test register.
4. Test login.
5. Test create lane.
6. Test edit route nodes.
7. Test save and refresh.
8. Test lane list.
9. Test report status.
10. Create at least three demo lanes.
11. Create one draft lane.
12. Create one pending lane.
13. Create one live lane.
14. Prepare demo user accounts.
15. Prepare final presentation flow.

## 16. Immediate Next Tasks

1. Commit frontend TypeScript build fix.
2. Commit backend MongoDB setup docs.
3. Rotate the exposed MongoDB password in Atlas.
4. Update local `backend/.env` with the new password.
5. Add `/health` endpoint.
6. Implement `User` model.
7. Implement real register/login.
8. Connect frontend auth to backend.
9. Implement `Lane` model.
10. Connect lane list to MongoDB data.
