import styles from "./styles.module.css";
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";
import { Textarea } from "@/components/textarea";
import { useSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useState } from "react";
import { FaTrash } from "react-icons/fa";

interface TaskProps {
    item: {
        tarefa: string;
        created: string;
        user: string;
        taskId: string;
        public: boolean;
    };
    allComments: CommentsProps[];
}

interface CommentsProps {
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
    created: string;
}

export default function Task({ item, allComments }: TaskProps) {
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [comments, setComments] = useState<CommentsProps[]>(allComments || []);

    async function handleComment(e: FormEvent) {
        e.preventDefault();
        if (input === "") {
            alert("Preencha o comentário antes de enviar.");
            return;
        }
        if (!session?.user?.email || !session?.user?.name) {
            alert("Você precisa estar logado para comentar.");
            return;
        }
        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            });
            const data = {
                id: docRef.id,
                comment: input,
                created: new Date().toLocaleDateString("pt-BR"),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            };
            setComments(prev => [...prev, data]);
            setInput("");
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
        }
    }

    async function handleDeleteComment(id: string) {
        try {
            const docRef = doc(db, "comments", id);
            await deleteDoc(docRef);
            const updatedComments = comments.filter(comment => comment.id !== id);
            setComments(updatedComments);
        } catch (error) {
            console.error("Erro ao deletar comentário:", error);
            alert("Erro ao deletar comentário.");
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>
            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>
            <section className={styles.commentsContainer}>
                <h2>Deixar um comentário</h2>
                <form onSubmit={handleComment}>
                    <Textarea value={input} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)} placeholder="Escreva seu comentário..." />
                    <button disabled={!session?.user} className={styles.button} type="submit">Enviar comentário</button>
                </form>
            </section>
            <section className={styles.commentsContainer}>
                <h2>Todos os comentários</h2>
                {comments.length === 0 && (
                    <span>Não há comentários para essa tarefa.</span>
                )}
                {comments.map((item) => (
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <span className={styles.commentUser}>{item.name}</span>
                            <time className={styles.commentDate}>{item.created}</time>
                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                                    <FaTrash size={18} color='#ea3140'/>
                                </button>
                            )}
                        </div>
                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}


export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;
    const docRef = doc(db, "tarefas", id);
    const q = query(collection(db, "comments"), where("taskId", "==", id));
    const snapshotComments = await getDocs(q);

    // eslint-disable-next-line prefer-const
    let allComments: CommentsProps[] = [];
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            created: new Date(doc.data().created.seconds * 1000).toLocaleDateString("pt-BR"),
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
        });
    });

    console.log(allComments);

    const docSnap = await getDoc(docRef);
    if (docSnap.data() === undefined) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    if (!docSnap.data()?.public) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    };

    const miliseconds = docSnap.data()?.created?.seconds * 1000;
    const task = {
        taskId: id,
        created: new Date(miliseconds).toLocaleDateString("pt-BR"),
        tarefa: docSnap.data()?.tarefa,
        user: docSnap.data()?.user,
        public: docSnap.data()?.public,
    };
    return {
        props: {
            item: task,
            allComments: allComments,
        },
    };
};


