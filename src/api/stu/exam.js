import request from '@/utils/request'

// 查询考试管理列表
export function listExam(query) {
  return request({
    url: '/stu/exam/list',
    method: 'get',
    params: query
  })
}

// 获取全部用户
export function getAllUser() {
  return request({
    url: '/stu/exam/getAllUser',
    method: 'get'
  })
}

export function startExam(data) {
  return request({
    url: '/stu/exam/startExam',
    method: 'post',
    data: data
  })
}

export function getStuExamById(id) {
  return request({
    url: '/stu/exam/getStuExamById/' + id,
    method: 'get'
  })
}
