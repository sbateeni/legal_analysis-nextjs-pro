import React from 'react';
import Image from 'next/image';

type ArticleCardProps = {
  imageUrl: string;
  title: string;
  excerpt: string;
  likes?: number;
  comments?: number;
  href?: string;
};

export default function ArticleCard({ imageUrl, title, excerpt, likes = 0, comments = 0, href }: ArticleCardProps) {
  const Wrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    href ? <a className={className} href={href}>{children}</a> : <div className={className}>{children}</div>
  );
  return (
    <Wrapper className="article-card fade-in">
      <div className="article-card__image">
        <Image 
          src={imageUrl} 
          alt={title} 
          width={400}
          height={160}
          style={{ width: '100%', height: 160, objectFit: 'cover' }}
        />
      </div>
      <div className="article-card__content">
        <h3 className="article-card__title headline-sm">{title}</h3>
        <p className="article-card__excerpt">{excerpt}</p>
        <div className="article-card__meta">
          <span>❤️ {likes}</span>
          <span>💬 {comments}</span>
        </div>
      </div>
    </Wrapper>
  );
}


