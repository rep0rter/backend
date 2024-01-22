import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer/index.js";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

import logger from "../utils/logger.js";

enum BodyType {
  text,
  html,
}

interface BodyData {
  type: BodyType;
  data: string;
}

enum ImageContentType {
  base64,
  buffer,
}

type ImageContent<T extends ImageContentType> =
  T extends ImageContentType.base64
    ? string
    : T extends ImageContentType.buffer
    ? Buffer
    : never;

interface EmbeddedImage<T extends ImageContentType> {
  imageContent: ImageContent<T>;
  type: T;
  cid: string;
  filename: string;
}

class EmailSender {
  private _username: string;
  private _password: string;

  private _transporter: nodemailer.Transporter;

  constructor(username: string, password: string) {
    this._transporter = nodemailer.createTransport({
      pool: true,
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: username,
        pass: password,
      },
    } as SMTPTransport.Options);

    this._username = username;
    this._password = password;
  }

  send(
    to: string,
    subject: string,
    body: BodyData,
    embedImages?: EmbeddedImage<ImageContentType>[]
  ) {
    let message: nodemailer.SendMailOptions = {
      from: this._username,
      to,
      subject,
      headers: {
        "x-send-by": "rep0rter-worker",
      },
    };

    if (body.type === BodyType.html) message.html = body.data;
    else if (body.type === BodyType.text) message.text = body.data;

    if (embedImages) {
      message.attachments = embedImages.map((item): Attachment => {
        let attachment: Attachment = {
          filename: item.filename,
          cid: item.cid,
        };

        if (item.type === ImageContentType.base64) {
          attachment.content = Buffer.from(
            item.imageContent as string,
            "base64"
          );
        } else if (item.type === ImageContentType.buffer) {
          attachment.content = item.imageContent as Buffer;
        }

        return attachment;
      });
    }

    this._transporter.sendMail(message, (error, info) => {
      if (error) {
        throw error;
      }

      logger.info("Email sent!", "email");
    });
  }

  verify() {
    return this._transporter.verify();
  }
}

export default EmailSender;
export { BodyType, BodyData, ImageContent, ImageContentType, EmbeddedImage };
