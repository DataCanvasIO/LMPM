import React, { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw'
import { message } from 'antd';
import copy from 'copy-to-clipboard'
import { overviewQuickguide } from '@/services/aiModel'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { gruvboxLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { IconFont } from 'components/icon';
import styles from './index.less';

const PromptGuide = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(async () => {
    const res = await overviewQuickguide();
    if(res) {
      setMarkdown(res);
    }
  }, []);

  const copyCode = (children) => {
    message.success('Copy successful!')
    copy(children[0].props.children[0])
  }

  const Pre = ({ children }) => {
    return (
      <div className={styles.blogPre}>
        <IconFont type="icon-fuzhi" className={styles.copyIcon} onClick={copyCode.bind(null, children)}/>
        {children}
      </div>
    )
  }

  return (
    <div className={styles.markdownBody}>
      <div className={styles.markdownContent}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          children={markdown}
          components={{
            pre: Pre,
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline ? (
                <SyntaxHighlighter
                  {...props}
                  children={String(children).replace(/\n$/, '')}
                  style={gruvboxLight}
                  language={match ? match[1] : 'shell'} // 匹配代码语言，默认给shell
                  PreTag="div"
                />
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              )
            }
          }}
        ></ReactMarkdown>
      </div>
    </div>
  )
}

export default PromptGuide
