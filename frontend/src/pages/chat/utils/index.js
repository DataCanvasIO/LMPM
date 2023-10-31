export function getContextList(newTalkList, selectVal) {
	const temp = [...Array.from(newTalkList)].reverse()
  
  if (temp[0].type === 'New') {
    const current = temp[1]
    return [{
      template_content: current.origin,
      role: current.promptList[0] ? current.promptList[0].role_name : '',
      role_prompt: current.promptList[0] ? current.promptList[0].role_prompt : '',
      prompt_variables: current.variables
    }]
  } else {
    let res = []
    for (let i = 0; i < temp.length; i++) {
      const current = temp[i]
      if (current.type === 'User' && !current.error) {
        res.push({
          template_content: current.origin,
          role: current.promptList[0] ? current.promptList[0].role_name : '',
          role_prompt: current.promptList[0] ? current.promptList[0].role_prompt : '',
          prompt_variables: current.variables
        })
        if (selectVal === 'Without-context') break
      } else if (current.type === 'Assistant' && !current.error && Object.prototype.toString.call(current.text) === "[object String]") {
        res.push({
          template_content: current.text,
          role: current.role,
        })
      } else if (current.type === 'New') {
        break
      }
    }
    return res.reverse()
  }
}
