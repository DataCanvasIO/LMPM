import { React } from 'react'
import { useLocation } from 'umi'
import { useImmer } from 'use-immer'
const Bread = () => {
  const location = useLocation()
  const [state, setState] = useImmer({
    breadcrumbItems: []
  })

  useEffect(() => {
    const pathSnippets = location.pathname.split('/').filter((i) => i)
    const breadItems = generateBreadcrumbItems(pathSnippets, routes[0].routes)
    setState((prevState) => {
      prevState.breadcrumbItems = breadItems
    })
}, [location.pathname])

  const generateBreadcrumbItems = (pathSnippets, routes) => {
    const breadRes = []
    pathSnippets.reduce((total, item) => {
      total = total.concat(item)
      const url = `/${total.join('/')}`
      const route = routes.filter((ite) => (ite.path === `/${total.join('/')}`))
      if(route.length > 0) {
        breadRes.push({ url, name: route[0].name })
      }
      return total
    }, [])
    return breadRes
  }

  const generateBreadcrumb = () => {
    return state.breadcrumbItems.map((item, index) => (
      <Breadcrumb.Item key={index}>
        {index === state.breadcrumbItems.length - 1 ? (
          <div>{item.name}</div>
        ) : (
          <Link to={item.url}>{item.name}</Link>
        )}
      </Breadcrumb.Item>
    ))
  }

  return (
    <Breadcrumb>
      {generateBreadcrumb()}
    </Breadcrumb>
  )
}

export default Bread
