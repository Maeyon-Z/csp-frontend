import request from '@/utils/request'

// 查询错题列表
export function listErrorExercise(query) {
    return request({
        url: '/stu/error/list',
        method: 'get',
        params: query
    })
}

// 删除错题
export function delExercise(id) {
    return request({
      url: '/stu/error/del/' + id,
      method: 'get'
    })
}