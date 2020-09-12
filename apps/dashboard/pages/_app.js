import '../src/style.scss'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return <>
    <Head>
      <link rel="manifest" href="/manifest.json" />
    </Head>
    <Component {...pageProps} />
  </>
}

export default MyApp;
