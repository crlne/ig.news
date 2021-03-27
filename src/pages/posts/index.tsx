import Head from 'next/head';
import React from 'react';
import styles from './styles.module.scss';
import { getPrismicClient } from '../../services/prismic'
import Prismic from '@prismicio/client'
import { GetStaticProps } from 'next';


export default function Posts() {
    return (
        <>
          <Head>
              <title>Posts | ig.news</title>
          </Head>

          <main className={styles.container}>
              <div className={styles.posts}>
                  <a href="#">
                      <time>26 de Março de 2021</time>
                      <strong>Creating a Monorepo with Lerna & Yarn Workspaces</strong>
                      <p>In this guide, you will learn how to crate a Monorepo to manage multiple packages with a</p>
                  </a>
                  <a href="#">
                      <time>26 de Março de 2021</time>
                      <strong>Creating a Monorepo with Lerna & Yarn Workspaces</strong>
                      <p>In this guide, you will learn how to crate a Monorepo to manage multiple packages with a</p>
                  </a>
                  <a href="#">
                      <time>26 de Março de 2021</time>
                      <strong>Creating a Monorepo with Lerna & Yarn Workspaces</strong>
                      <p>In this guide, you will learn how to crate a Monorepo to manage multiple packages with a</p>
                  </a>
              </div>
          </main>
        </>

    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient()

    const response = await prismic.query([
         Prismic.predicates.at('document.type', 'publication')
    ], {
        fetch: ['publication.title', 'publication.content'],
        pageSize: 100,
    })

    console.log(response)

    return {
        props: {}
    }

}