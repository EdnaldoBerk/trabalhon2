import BookList from "./components/BookList";
import styles from "@/style/page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <BookList />
      </main>
    </div>
  );
}
