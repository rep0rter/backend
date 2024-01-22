import axios from "axios";
import EmailSender from "./email/index.js";
import { BodyType, ImageContentType } from "./email/index.js";

import logger from "./utils/logger.js";

if (!process.env.GMAIL_USERNAME || !process.env.GMAIL_PASSWORD) {
  logger.error("GMAIL_USERNAME or GMAIL_PASSWORD is empty!", "main");
  process.exit(1);
}

const Sender = new EmailSender(
  process.env.GMAIL_USERNAME,
  process.env.GMAIL_PASSWORD
);

let image = await axios.get(
  "https://www.gravatar.com/avatar/415a2a122d4390914ea08a12034392ef?s=512",
  {
    responseType: "arraybuffer",
  }
);

let imageBuf = Buffer.from(image.data, "binary").toString("base64");

Sender.send(
  "wolf@wolf-yuan.dev",
  "Test email",
  {
    type: BodyType.html,
    data:
      "<h1 style='text-align: center;'>Hello world!</h1>" +
      "<p>Image with Buffer</p>" +
      "<img src='cid:avatar-01' />" +
      "<p>Image with base64</p>" +
      "<img src='cid:avatar-02' />",
  },
  [
    {
      cid: "avatar-01",
      filename: "avatar-01.png",
      imageContent: image.data as Buffer,
      type: ImageContentType.buffer,
    },
    {
      cid: "avatar-02",
      filename: "avatar-02.png",
      imageContent: imageBuf,
      type: ImageContentType.base64,
    },
  ]
);
