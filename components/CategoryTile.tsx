import Image from "next/image";
import Link from "next/link";
import styles from "./CategoryTile.module.css";

type CategoryTileProps = {
  href: string;
  title: string;
  line: string;
  image: string;
  alt: string;
  tone: "sweet" | "salty";
  size?: "large" | "small";
};

export default function CategoryTile({ href, title, line, image, alt, tone, size = "large" }: CategoryTileProps) {
  return (
    <Link href={href} className={`${styles.tile} ${styles[tone]} ${size === "small" ? styles.small : ""}`}>
      <span className={styles.ring}>
        <span className={styles.photoWrap}>
          <Image src={image} alt={alt} fill sizes={size === "small" ? "200px" : "(max-width: 700px) 45vw, 360px"} className={styles.photo} />
        </span>
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.line}>{line}</span>
    </Link>
  );
}
