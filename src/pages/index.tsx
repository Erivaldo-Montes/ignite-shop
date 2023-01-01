import Image from 'next/image'
import { HomeContainer, Product } from '../styles/pages/home'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { stripe } from '../lib/stripe'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import Stripe from 'stripe'

interface HomeProps {
  products: {
    name: string
    id: string
    imageUrl: string
    price: string
  }[]
}

export default function Home({ products }: HomeProps) {
  // keen-slider serve para slides(observar o containerSlides do radix)
  // ref são referêcias pra um elementos na DOM
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 2.5,
      spacing: 48,
    },
  })

  return (
    <HomeContainer ref={sliderRef}>
      {products.map((product) => {
        return (
          // permite ser redirecionado dentro da aplicação sem ter recerregar a pagina
          <Link href={`/product/${product.id}`} key={product.id}>
            {/* blur hash */}
            <Product className="keen-slider__slide">
              <Image src={product.imageUrl} height={520} width={480} alt="" />
              <footer>
                <strong>{product.name}</strong>
                <span>{product.price}</span>
              </footer>
            </Product>
          </Link>
        )
      })}
    </HomeContainer>
  )
}

// aplicando conceito de ssg, em vez de ssr
export const getStaticProps: GetStaticProps = async () => {
  const reponse = await stripe.products.list({
    // como a resposta vem apenas o relacionamanto entre o preço e o produto temos que expandir a resposta
    expand: ['data.default_price'],
  })

  const products = reponse.data.map((product) => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      imageUrl: product.images[0],
      name: product.name,
      // stripe salva o preço em centavos
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price.unit_amount! / 100),
    }
  })

  console.log(reponse.data)
  return {
    props: { products },
    revalidate: 60 * 60 * 2, // 2 horas
  }
}
