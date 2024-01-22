import markdownIt from "markdown-it";

const markdown = new markdownIt();

enum Weekdays {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

interface Article {
  title: string;
  shortDesc: string;
  avatar: string;
  avatarAlt?: string;
  author: string;
  time: Weekdays;
  reference: string;
}

enum CurrentType {
  title,
  desc,
  metadata,
}

function parseArticles(markdownData: string): Article {
  let markdownParsedData = markdown.parse(markdownData, {});
  let parsedArticle: Article = {
    title: "",
    shortDesc: "",
    avatar: "",
    avatarAlt: "",
    author: "",
    time: Weekdays.Monday,
    reference: "",
  };

  // Parsing stats
  let titleOpened = false,
    descOpened = false,
    metadataListOpened = false,
    metadataOpened = false;

  for (let token of markdownParsedData) {
    switch (token.type) {
      case "inline":
        if (titleOpened) {
          parsedArticle.title = token.content.trim();
          break;
        } else if (descOpened) {
          parsedArticle.shortDesc = token.content.trim();
          break;
        } else if (metadataOpened) {
          let metadata = token.content.split(":");
          if (!metadata) throw new Error("Metadata unknown");

          switch (metadata[0]) {
            case "avatar":
              metadata.shift();
              let avatarParsed = markdown.parse(metadata.join(":"), {});
              let avatarUrl = avatarParsed
                .filter((i) => i.type === "inline")[0]
                ?.children?.[0]?.attrs?.filter((i) => i[0] === "src")[0][1];
              let avatarAlt = avatarParsed.filter((i) => i.type === "inline")[0]
                ?.children?.[0].content;

              if (!avatarUrl) throw new Error("No avatar defined");
              parsedArticle.avatar = avatarUrl;
              parsedArticle.avatarAlt = avatarAlt;
              break;
            case "name":
              metadata.shift();
              parsedArticle.author = metadata.join(":").trim();
              break;
            case "time":
              metadata.shift();
              let date = metadata.join(":").trim();

              switch (date) {
                case "Monday":
                  parsedArticle.time = Weekdays.Monday;
                  break;
                case "Tuesday":
                  parsedArticle.time = Weekdays.Tuesday;
                  break;
                case "Wednesday":
                  parsedArticle.time = Weekdays.Wednesday;
                  break;
                case "Thursday":
                  parsedArticle.time = Weekdays.Thursday;
                  break;
                case "Friday":
                  parsedArticle.time = Weekdays.Friday;
                  break;
                case "Saturday":
                  parsedArticle.time = Weekdays.Saturday;
                  break;
                case "Sunday":
                  parsedArticle.time = Weekdays.Sunday;
                  break;
                default:
                  throw new Error(`Unexpected date ${date}`);
              }
              break;
            case "reference":
              metadata.shift();
              parsedArticle.reference = metadata.join(":").trim();
          }
        }
        break;
      case "heading_open":
        titleOpened = true;
        break;
      case "heading_close":
        titleOpened = false;
        break;
      case "paragraph_open":
        if (!metadataListOpened) descOpened = true;
        break;
      case "paragraph_close":
        descOpened = false;
        break;
      case "bullet_list_open":
        metadataListOpened = true;
        break;
      case "list_item_open":
        metadataOpened = true;
        break;
      case "list_item_close":
        metadataOpened = false;
        break;
      case "bullet_list_close":
        metadataListOpened = false;
        break;
    }
  }

  return parsedArticle;
}

export default parseArticles;
