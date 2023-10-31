import { useImmer } from 'use-immer'

export default () => {
  const [globalState, setGlobalState] = useImmer({
    edgeName: '加载中'
  })

  return {
    globalState,
    setGlobalState,
  }
}
