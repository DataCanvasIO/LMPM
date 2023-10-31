import { React, useEffect } from 'react'
import { history } from 'umi'
import { useImmer } from 'use-immer'
import { Col, Row, Button, Typography, message } from 'antd'
import copy from 'copy-to-clipboard'
import Empty from 'components/empty'
import { IconFont } from 'components/icon'
import { getOverviewComponent, getPromptApp } from '@/services/overview'
import { formatTimeStamp } from '@/utils'
import styles from './index.less'

const Overview = () => {
  const stepItems = [
    {
      name: 'Step1',
      title: 'Add AI model',
      desc: 'Connect AI models to response your prompts.',
      img: require('@/assets/overview-1.png')
    },
    {
      name: 'Step2',
      title: 'Prompt  market',
      desc: 'Select appropriate prompts to request the large model.',
      img: require('@/assets/overview-2.png')
    },
    {
      name: 'Step3',
      title: 'Design prompt',
      desc: 'Design your own prompts in Chat of Prompt Engineering.',
      img: require('@/assets/overview-3.png')
    },
    {
      name: 'Step4',
      title: 'Build flow',
      desc: 'Build a prompt flow with multiple prompts.',
      img: require('@/assets/overview-4.png')
    },
    {
      name: 'Step5',
      title: 'Apply flow',
      desc: 'Publish the flow as an application and use it in the business system through an API.',
      img: require('@/assets/overview-5.png')
    },
  ]

  const modelItems = [
    {
      title: 'Prompt',
      key: 'prompt',
      icon: 'prompt',
    },
    {
      title: 'Model',
      key: 'model',
      icon: 'Model',
    },
    {
      title: 'Flow',
      key: 'flow',
      icon: 'flow',
    },
    {
      title: 'App',
      key: 'app',
      icon: 'a-promptapp'
    },
  ]

  const [state, setState] = useImmer({
    overviewCount: [],
    promptItems: [], // prompt app列表
  })

  const getOverviewSub = async () => {
    const res = await getOverviewComponent()
    setState((prev) => {
      prev.overviewCount = modelItems.map((ite) => {
        if(ite.key && res[ite.key]) {
          return res[ite.key]
        } else {
          return 0
        }
      })
    })
  }

  const gotoPromptApp = () => {
    history.push('/Prompt-App')
  }

  const getPromptAppList = async () => {
    const res = await getPromptApp({
      pageIndex: 1,
      pageNum: 5,
      orderKey: 'update_time',
      orderBy: 'desc'
    })
    setState((prev) => {
      let data = res.rows ? res.rows : []
      prev.promptItems = data.map((item) => ({
        name: item.name,
        url: item.url,
        type: Array.isArray(item.input_info) ? item.input_info.map((ite) => ite.variable).join(',') : item.input_info,
        updateTime: item.update_time
      }))
    })
  }

  const copyUrl = (text) => {
    copy(text)
    message.success('Copy successful!')
  }

  const openToolKit = () => {
    window.open('https://pypi.org/project/PromptManager/#files');
  }

  useEffect(() => {
    getOverviewSub()
    getPromptAppList()
  }, [])

  return (
    <>
      <div className={styles.overviewContainer}>
        <div className={styles.descInfo}>
          <div className={styles.descTitle}>
            <IconFont type="icon-gailan"/>
            <span style={{ marginLeft: 8 }}>Overview</span>
          </div>
          <div className={styles.info}>
            <span className={styles.boldText}>Prompt Manager</span> is an open-source tool for <span className={styles.boldText}>Prompt Engineering</span>. 
            You can design prompts and prompt flows to improve the response accuracy of the large model. 
            You can select appropriate prompts in <span className={styles.boldText}>Prompt Market</span> or create your own prompts in <span className={styles.boldText}>Prompt Engineering</span> and make requests to the large models that have already been added to the <span className={styles.boldText}>AI Model</span>.
            You can build a prompt flow to process and engineer prompts and publish it as an application. 
            You can download the<Button type='link' className={styles.linkText} onClick={openToolKit}>open-source toolkit</Button>
          </div>
        </div>
        <div className={styles.modelContent}>
          <div className={styles.stepsInfo}>
            {stepItems.map((ite) => (
              <div className={styles.stepItem}>
                <div className={styles.title}>
                  {ite.name}
                </div>
                <div className={styles.stepImg}>
                  <img src={ite.img} />
                </div>
                <div className={styles.info}>{ite.title}</div>
                <div className={styles.desc}>{ite.desc}</div>
              </div>
            ))}
          </div>
          <Row className={styles.subTotal}>
            {modelItems.map((ite, idx) => (
              <Col span={6} className={styles.subItem}>
                <div className={styles.modeItem}>
                  <div className={styles.modelIcon}>
                    <IconFont className={styles.iconFont} type={`icon-${ite.icon}`} />
                  </div>
                  <div className={styles.num}>{state.overviewCount[idx]}</div>
                  <div className={styles.title}>{ite.title}</div>
                </div>
              </Col>
            ))}
          </Row>
          <div className={styles.promptTable}>
            <div className={styles.promptHeader}>
              <div className={styles.title}><span>Prompt App</span><span>（The lastest five apps）</span></div>
              <Button type='link' onClick={gotoPromptApp}>More</Button>
            </div>
            <div className={styles.promptContent}>
              {state.promptItems.length === 0 && (
                <div className={styles.empty}>
                  <Empty />
                </div>
              )}
              {state.promptItems.length > 0 && state.promptItems.map((item) => (
                <Row className={styles.tableItem} align="middle">
                  <Col span={6}>
                    <div className={styles.tableName}>
                      {item.name}
                    </div>
                  </Col>
                  <Col span={6}>
                    <IconFont type="icon-lianjie" className={styles.tableColIcon}/>
                    <Typography.Text ellipsis={{ tooltip: item.url, rows: 1 }} className={styles.tableUrl}>
                      {item.url}
                    </Typography.Text>
                    <IconFont type="icon-fuzhi" onClick={copyUrl.bind(null, item.url)} className={styles.tableColCopy}/>
                  </Col>
                  <Col span={1}></Col>
                  <Col span={5}>
                    <IconFont type="icon-bianliang" className={styles.tableColIcon}/>
                    <Typography.Text ellipsis={{ tooltip: item.type, rows: 1 }} className={styles.tableType}>
                      {item.type}
                    </Typography.Text>
                  </Col>
                  <Col span={6}>
                    <IconFont type="icon-shijian" className={styles.tableColIcon} style={{ marginRight: 10 }}/>
                    <div className={styles.tableTime}>
                      {formatTimeStamp(item.updateTime, true)}
                    </div>
                  </Col>
                </Row>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Overview
