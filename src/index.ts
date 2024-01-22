import EmailSender from "./email/index.js";
import { BodyType } from "./email/index.js";

import logger from "./utils/logger.js";

if (!process.env.GMAIL_USERNAME || !process.env.GMAIL_PASSWORD) {
  logger.error("GMAIL_USERNAME or GMAIL_PASSWORD is empty!", "main");
  process.exit(1);
}

const Sender = new EmailSender(
  process.env.GMAIL_USERNAME,
  process.env.GMAIL_PASSWORD
);

Sender.send("wolf@wolf-yuan.dev", "Test email", {
  type: BodyType.html,
  data: "Hello world!",
});
