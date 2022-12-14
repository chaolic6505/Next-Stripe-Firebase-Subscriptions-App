import { getProducts, Product } from '@stripe/firestore-stripe-payments';
import Head from 'next/head';
import { useRecoilValue } from 'recoil';
import { modalState, movieState } from '../atoms/modalAtom.';
import Banner from '../components/Banner';
import Header from '../components/Header';
import Modal from '../components/Modal';
import Plans from '../components/Plans';
import Row from '../components/Row';
import useAuth from '../hooks/useAuth';
import useList from '../hooks/useList';
import useSubscription from '../hooks/useSubscription';
import payments from '../lib/stripe';
import { Movie } from '../typings';
import requests from '../utils/requests';

interface Props {
  netflixOriginals: Movie[];
  trendingNow: Movie[];
  topRated: Movie[];
  actionMovies: Movie[];
  comedyMovies: Movie[];
  horrorMovies: Movie[];
  romanceMovies: Movie[];
  documentaries: Movie[];
  plans: Product[];
}

const Home = ({
  netflixOriginals,
  actionMovies,
  comedyMovies,
  documentaries,
  horrorMovies,
  romanceMovies,
  topRated,
  trendingNow,
  plans,
}: Props) => {
  console.log(plans, 'plans');
  const { user, loading } = useAuth();
  const showModal = useRecoilValue(modalState);
  const movie = useRecoilValue(movieState);
  const list = useList(user?.uid);
  const subscription = useSubscription(user);

  if (loading || subscription === null) return null;

  if (!subscription) return <Plans plans={plans} />;

  return (
    <div
      className={`relative h-screen bg-gradient-to-b from-gray-900/10 to-[#010511] lg:h-[140vh] ${
        showModal ? '!h-screen overflow-hidden' : null
      }`}
    >
      <Head>
        <title>
          {movie?.title || movie?.original_name || 'Home'} - Netflix
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="relative pl-4 pb-24 lg:space-y-24 lg:pl-16 ">
        <Banner netflixOriginals={netflixOriginals} />

        <section className="md:space-y-24">
          {/* My List */}
          {list.length > 0 && <Row title="My List" movies={list} />}
          <Row title="Trending Now" movies={trendingNow} />
          <Row title="Top Rated" movies={topRated} />
          <Row title="Action Thrillers" movies={actionMovies} />
          <Row title="Comedies" movies={comedyMovies} />
          <Row title="Scary Movies" movies={horrorMovies} />
          <Row title="Romance Movies" movies={romanceMovies} />
          <Row title="Documentaries" movies={documentaries} />
        </section>
      </main>
      {showModal ? <Modal /> : null}
    </div>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const plans = await getProducts(payments, {
    includePrices: true,
    activeOnly: true,
  })
    .then((res) => res)
    .catch((error) => console.log(error.message));

  const [
    netflixOriginals,
    trendingNow,
    topRated,
    actionMovies,
    comedyMovies,
    horrorMovies,
    romanceMovies,
    documentaries,
  ] = await Promise.all([
    fetch(requests.fetchTrending).then((res) => res.json()),
    fetch(requests.fetchTopRated).then((res) => res.json()),
    fetch(requests.fetchActionMovies).then((res) => res.json()),
    fetch(requests.fetchComedyMovies).then((res) => res.json()),
    fetch(requests.fetchHorrorMovies).then((res) => res.json()),
    fetch(requests.fetchRomanceMovies).then((res) => res.json()),
    fetch(requests.fetchDocumentaries).then((res) => res.json()),
    fetch(requests.fetchNetflixOriginals).then((res) => res.json()),
  ]);

  return {
    props: {
      plans,
      topRated: topRated.results,
      trendingNow: trendingNow.results,
      actionMovies: actionMovies.results,
      comedyMovies: comedyMovies.results,
      horrorMovies: horrorMovies.results,
      romanceMovies: romanceMovies.results,
      documentaries: documentaries.results,
      netflixOriginals: netflixOriginals.results,
    },
  };
};
