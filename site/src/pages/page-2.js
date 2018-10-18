import React from 'react'
import { Link , graphql} from 'gatsby'


import Layout from '../components/layout'

export default   ({data}) =>{ 
  const { allAnillos66Json:{ edges }  } = data;
  const items= edges.map(edge=>edge.node);
  return (
  <Layout>
    {items.map((item,i)=>(
        <div  key={i}>
           {item.source} 
           <img src={item.img} data-code={item.code} />
        </div>
      ))}
  </Layout>
);}

export const query = graphql`
{
  allAnillos66Json {
    edges {
      node {
        source,
        code,
        name,
        img,
        prices{
          wholeSale
        }
      }
    }
  }
}
`
