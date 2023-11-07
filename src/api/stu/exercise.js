import request from '@/utils/request'

// 查询题目详细
export function getExercise(id) {
  return request({
    url: '/stu/exercise/' + id,
    method: 'get'
  })
}

// 获取子题
export function getQues(parentId) {
  return request({
    url: '/stu/exercise/ques/' + parentId,
    method: 'get'
  })
}