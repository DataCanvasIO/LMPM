import { Menu } from 'antd'
import { useMemo } from 'react'
import { transverse } from '@/utils'

const PromptMenu = (props) => {
  const { menuRoutes } = props

  const menuTree = transverse(menuRoutes, 0)

  const activeKey = useMemo(() => {
    const routeRes = menuRoutes.filter((item) => (item.path === location.pathname))
    return routeRes.length > 0 ? routeRes[0].key : ''
  }, [location.pathname])

  return (
    <>
      <Menu selectedKeys={[activeKey]} mode="horizontal" items={menuTree} />
    </>
  )
}

export default PromptMenu