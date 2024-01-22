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

function parseArticles(markdownData: string): Article[] {
  let markdownParsedData = markdown.parse(markdownData, {}),
    parsedArticles: Article[] = [];

  // Parsing stats
  let articleOpened = false,
    titleOpened = false,
    descOpened = false,
    metadataListOpened = false,
    metadataOpened = false;

  // Temp data
  let currentArticle: Article = {
    title: "",
    shortDesc: "",
    avatar: "",
    avatarAlt: "",
    author: "",
    time: Weekdays.Monday,
    reference: "",
  };

  for (let token of markdownParsedData) {
    switch (token.type) {
      case "inline":
        if (titleOpened) {
          currentArticle.title = token.content.trim();
          break;
        } else if (descOpened) {
          currentArticle.shortDesc = token.content.trim();
          break;
        } else if (metadataOpened) {
          let metadata = token.content.split(":");
          if (!metadata) throw new Error("Metadata unknown");

          switch (metadata[0]) {
            case "avatar":
              metadata.shift();
              let avatarParsed = markdown.parse(metadata.join(":"), {});
              let imageAttrs = avatarParsed.filter(
                (i) => i.type === "inline"
              )[0]?.children?.[0]?.attrs;

              if (!imageAttrs)
                throw new Error("Parsed image but attrs is empty");

              for (let attr of imageAttrs) {
                switch (attr[0]) {
                  case "src":
                    currentArticle.avatar = attr[1];
                    break;
                  case "alt":
                    currentArticle.avatarAlt = attr[1];
                    break;
                }
              }
              break;
            case "name":
              metadata.shift();
              currentArticle.author = metadata.join(":").trim();
              break;
            case "time":
              metadata.shift();
              let date = metadata.join(":").trim();

              switch (date) {
                case "Monday":
                  currentArticle.time = Weekdays.Monday;
                  break;
                case "Tuesday":
                  currentArticle.time = Weekdays.Tuesday;
                  break;
                case "Wednesday":
                  currentArticle.time = Weekdays.Wednesday;
                  break;
                case "Thursday":
                  currentArticle.time = Weekdays.Thursday;
                  break;
                case "Friday":
                  currentArticle.time = Weekdays.Friday;
                  break;
                case "Saturday":
                  currentArticle.time = Weekdays.Saturday;
                  break;
                case "Sunday":
                  currentArticle.time = Weekdays.Sunday;
                  break;
                default:
                  throw new Error(`Unexpected date ${date}`);
              }
              break;
            case "reference":
              metadata.shift();
              currentArticle.reference = metadata.join(":").trim();
          }
        }
        break;
      case "heading_open":
        if (articleOpened) {
          // Current article finished parsing
          parsedArticles.push(currentArticle);
        }
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
  parsedArticles.push(currentArticle);

  return parsedArticles;
}

export default parseArticles;
