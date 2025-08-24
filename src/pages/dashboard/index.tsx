import { GetServerSideProps } from "next";
import styles from "@/pages/dashboard/dashboard.module.css";
import Head from 'next/head';
import { getSession } from "next-auth/react";
import { Textarea } from "@/components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";
import Link from "next/link";

interface HomeProps {
    user: {
        email: string;
    }
}

interface TaskProps {
    id: string;
    tarefa: string;
    created: Date;
    user: string;
    public: boolean;
}

export default function Dashboard({ user }: HomeProps) {
    const [input, setInput] = useState('')
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => {
        async function loadTarefas() {
            const tarefasRef = collection(db, "tarefas");
            const q = query(
                tarefasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            );
            onSnapshot(q, (snapshot) => {
                const lista = [] as TaskProps[];
                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    });
                });
                setTasks(lista);
            });
        }
        loadTarefas()
    }, [user?.email])

    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked)
    }

    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault()
        if (input === '') return;
        try {
            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            });
            setInput('');
            setPublicTask(false);
        } catch (error) {
            console.log(error);
        }
    }
    async function handleShare(id: string) {
        await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`)
        alert('Link copiado com sucesso!')
    }

    async function handleDeleteTask(id: string) {
        const tarefaRef = collection(db, "tarefas");
        const q = query(
            tarefaRef,
            where("user", "==", user?.email),
            where("__name__", "==", id)
        );
        onSnapshot(q, (snapshot) => {
            snapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        });
    }
    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual a sua tarefa?</h1>
                        <form onSubmit={handleRegisterTask}>
                            <Textarea value={input} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)} placeholder="Digite qual sua tarefa..." />
                            <div className={styles.checkboxArea}>
                                <input checked={publicTask} onChange={handleChangePublic} type="checkbox" className={styles.checkbox} />
                                <label>Deixar tarefa publica?</label>
                            </div>
                            <button type="submit" className={styles.button}>
                                Registar
                            </button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>
                    {tasks.map((item) => (
                        <article key={item.id} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>PUBLICO</label>
                                    <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                                        <FiShare2 size={22} color="#3183ff" />
                                    </button>
                                </div>
                            )}
                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>{item.tarefa}</p>
                                    </Link>
                                ) : (
                                    <p>{item.tarefa}</p>
                                )}
                                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash size={24} color="#ea3140" />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}


export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req })
    if (!session?.user) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }
    return {
        props: {
            user: {
                email: session?.user?.email,
            }
        },
    };
};