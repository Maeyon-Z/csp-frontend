import request from '@/utils/request'

// 查询考试管理列表
export function listExam(query) {
  return request({
    url: '/dataControl/exam/list',
    method: 'get',
    params: query
  })
}

// 查询考试管理详细
export function getExam(id) {
  return request({
    url: '/dataControl/exam/' + id,
    method: 'get'
  })
}

// 新增考试管理
export function addExam(data) {
  return request({
    url: '/dataControl/exam',
    method: 'post',
    data: data
  })
}

// 修改考试管理
export function updateExam(data) {
  return request({
    url: '/dataControl/exam',
    method: 'put',
    data: data
  })
}

export function delExam(id) {
  return request({
    url: '/dataControl/exam/' + id,
    method: 'delete'
  })
}

export function getAllUser(id) {
  return request({
    url: '/dataControl/exam/getAllUser',
    method: 'get'
  })
}

export function getAllDept(id) {
  return request({
    url: '/dataControl/exam/getAllDept',
    method: 'get'
  })
}