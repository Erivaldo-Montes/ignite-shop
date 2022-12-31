import Image from 'next/image'
import { HomeContainer, Product } from '../styles/pages/home'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { stripe } from '../lib/stripe'
import { GetServerSideProps } from 'next'
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
          // blur hash
          <Product key={product.id} className="keen-slider__slide">
            <Image src={product.imageUrl} height={520} width={480} alt="" />
            <footer>
              <strong>{product.name}</strong>
              <span>R$ {product.price}</span>
            </footer>
          </Product>
        )
      })}
    </HomeContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
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
      price: price.unit_amount / 100,
    }
  })

  console.log(reponse.data)
  return {
    props: { products },
  }
}
