

const Input = ({
    label='',
    name='',
    type='text',
    inputClassName='', 
    className='',
    isRequired = false,
    placeholder='',
    value='',
    onChange = () => {},
    onKeyDown = () => {}

}) => {
  return (
    <div className={`${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-800 ">{label}</label>
      <input onKeyDown={onKeyDown} value={value} onChange={onChange} type={type} id={name} className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${inputClassName}`} placeholder={placeholder} required={isRequired} />
    </div>
  )
}

export default Input
