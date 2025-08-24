// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from "@/components/textarea/styles.module.css";
import { HTMLProps } from "react";

export function Textarea({...rest}: HTMLProps<HTMLTextAreaElement>) {
    return <textarea className={styles.textarea} {...rest}></textarea>;
}