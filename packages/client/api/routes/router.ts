import { Hono } from "hono";
import profile from "./profile";
import waitlist from "./waitlist";

const routes = new Hono()
.route("/profile", profile)
.route("/waitlist", waitlist)
// Handle trailing slash for waitlist
.route("/waitlist/", waitlist)

export default routes;