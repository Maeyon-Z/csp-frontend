import request from '@/utils/request'

// 查询题目列表
export function listExercise(query) {
  return request({
    url: '/dataControl/exercise/list',
    method: 'get',
    params: query
  })
}

// 查询题目详细
export function getExercise(id) {
  return request({
    url: '/dataControl/exercise/' + id,
    method: 'get'
  })
}

// 新增题目
export function addExercise(data) {
  return request({
    url: '/dataControl/exercise',
    method: 'post',
    data: data
  })
}

// 修改题目
export function updateExercise(data) {
  return request({
    url: '/dataControl/exercise',
    method: 'put',
    data: data
  })
}

// 删除题目
export function delExercise(id) {
  return request({
    url: '/dataControl/exercise/' + id,
    method: 'delete'
  })
}

// 获取子题
export function getQues(parentId) {
  return request({
    url: '/dataControl/exercise/ques/' + parentId,
    method: 'get'
  })
}
