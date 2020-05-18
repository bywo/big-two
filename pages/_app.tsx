import Head from "next/head";

export default function MyApp({
  Component,
  pageProps,
}: {
  Component: any;
  pageProps: any;
}) {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style global jsx>
        {`
          body {
            font-family: "Fredoka One";
            background-color: #fff3e3;
          }

          * {
            box-sizing: border-box;
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  );
}
