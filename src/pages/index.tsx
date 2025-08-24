import { GetStaticProps } from "next";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Image from "next/image";
import heroImg from "../../public/assets/hero.png";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

type HomeProps = {
  posts: number;
  comments: number;
};

export default function Home({ posts, comments }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image priority className={styles.hero} src={heroImg} alt="logo tarefas+"></Image>
        </div>
        <h1 className={styles.title}>Sistema feito para você organizar<br/> seus estudos e tarefas</h1>
        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const commentsSnapshot = await getDocs(commentRef);
  const postRef = collection(db, "tarefas");
  const postsSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postsSnapshot.size || 0,
      comments: commentsSnapshot.size || 0,
    },
    revalidate: 60,
  };
};