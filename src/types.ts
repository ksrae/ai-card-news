export interface CardNewsItem {
  slide_no: number;
  headline: string;
  description: string;
}

export interface ArticleSection {
  sub_title: string;
  content: string;
}

export interface ArticleData {
  title: string;
  meta_description: string;
  sections: ArticleSection[];
  tags: string[];
}

export interface GenerationResult {
  card_news: CardNewsItem[];
  article: ArticleData;
}
