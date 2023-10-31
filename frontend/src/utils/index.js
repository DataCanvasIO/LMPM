import { v4 as uuidv4 } from 'uuid'
import request from './request'
import { IconFont } from '../components/icon'
import { Link } from 'umi'

/**
 * 获取唯一标识id
 * @returns uuid
 */
export const UUID = () => {
	return uuidv4()
}

export const getUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const transverse = (arr, rootId) => {
	return arr.filter((item) => {
    if(item.parentKey === rootId) {
      const test = transverse(arr, item.key)
      item.children = test.length > 0 ? test : null
    }
    // redirect first one
    item.label = (
      <Link to={item.children ? item.children[0].path : item.path}>
        {item.ic ? <IconFont type={`icon-${item.ic}`} style={{ marginRight: '8px' }} /> : ''} {item.name}
      </Link>
    )
    return item.parentKey === rootId && !item.isHide
	})
}

/**
 * check name is Exist
 * @param {*} url api Url
 * @param {*} originValue origin name
 * @param {*} message check failed msg
 */
let asyncNameTime = null
let asyncNickNameTime = null
let asyncEmailTime = null
export const asyncName = (url, originValue, message = 'Name already exists!', type, cb, standard = false) => {
  return {
    validator: (rule, value2) => {
      return new Promise((resolve, reject) => {
        if (!value2) {
          reject()
          return
        }
        if (standard && !isStandard(value2)) {
          reject(intl.getStr('formvalid.name'))
          return
        }
        if (value2 && /^[\s]*$/.test(value2)) {
          reject('Cannot enter spaces')
          return
        }
        let value = value2.replace(/(^\s*)|(\s*$)/g, '')
        if (!value) {
          reject()
          return
        }
        if (originValue && originValue === value) {
          resolve()
          return
        }
        if (type && type === 'nickname') {
          clearTimeout(asyncNickNameTime)
        } else if (type && type === 'email') {
          clearTimeout(asyncEmailTime)
        } else {
          clearTimeout(asyncNameTime)
        }
        const Timer = setTimeout(() => {
          const response = request.get(`${typeof url === 'string' ? url : url?.()}${encodeURIComponent(value)}`)
          response.then((res) => {
            const isExists = res && (res.exists || res.existed || res.isExists)
            cb && cb()
            if (isExists) {
              reject(message)
              return
            }
            resolve(value)
            return
          })
        }, 400)
        if (type && type === 'nickname') {
          asyncNickNameTime = Timer
        } else if (type && type === 'email') {
          asyncEmailTime = Timer
        } else {
          asyncNameTime = Timer
        }
      })
    },
  }
}

/***
 * @param {*} timestamp
 */
export function formatTimeStamp(timestamp, hasHMS = false) {
	const enMonthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May' , 'Jun', 'Jul', 'Aug',  'Sept', 'Oct', 'Nov',  'Dec'];
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = ("0" + date.getDate()).slice(-2);

  if (hasHMS) {
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    const newHours = hours > 12 ? hours - 12 : hours;
    const apm = hours < 12 ? 'am' : 'pm'
    return `${enMonthArr[month]} ${day}, ${year} ${newHours}:${minutes} ${apm}`;
  }
  return `${enMonthArr[month]} ${day}, ${year}`;
}

export function debouncePromise(fn, time) {
	let timer = null;
	return function(...args) {
		if(timer) {
			clearTimeout(timer);
		}
		// for form validate promise
		return new Promise((resolve) => {
			timer = setTimeout(() => {
				resolve(fn.call(null, ...args))
			}, time);
		});
	}
}

export function debounceFn(fn, time) {
	let timer = null;
	return function(...args) {
		if(timer) {
			clearTimeout(timer);
		}
		return timer = setTimeout(() => {
      fn.call(null, ...args)
    }, time);
	}
}

