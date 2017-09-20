((factory, root) ->
	if typeof define is 'function' and define.amd
		define [], factory
	else if module? and module.exports
		module.exports = factory()
	else
		root.Hash = factory()
)(() ->
	class Hash
		remove: (data, path) ->
			tokens = @tokenize path
			if path.indexOf('{') is -1
				return @simpleOp 'remove', data, path
			token = tokens.shift()
			nextPath = tokens.join '.'
			for own key, value of data
				if @matchToken key, token
					if value and (@isObject(value) or @isArray(value)) && nextPath
						if nextPath.split('.').shift() is '{n}' and @isArray(value)
							delete data[key]
						else
							value = @remove value, nextPath
					else if @isArray(data)
						data.splice key, 1
					else
						delete data[key]
			data
		insert: (data, path, insertValue) ->
			tokens = @tokenize path
			expand = {}
			if path.indexOf('{') is -1 and path.indexOf('[]') is -1
				return @simpleOp 'insert', data, path, insertValue
			if @keys(data).length or data.length > 0
				token = tokens.shift()
				nextPath = tokens.join '.'
				for own key, value of data
					if @matchToken key, token
						if nextPath is ''
							data[key] = insertValue
						else
							data[key] = @insert data[key], nextPath, insertValue
			else
				expand[path] = insertValue
				return @expand expand
			data
		simpleOp: (operation, data, path, value) ->
			tokens = @tokenize(path)
			hold = data
			for token in tokens
				if operation is 'insert'
					if _i is tokens.length - 1
						hold[token] = value
						return data
					if not @isObject(hold[token]) && not @isArray(hold[token])
						if not isNaN parseInt tokens[_i + 1]
							hold[token] = []
						else
							hold[token] = {}
					hold = hold[token];
				else if operation is 'remove'
					if _i is tokens.length - 1
						(removed = {}).item = hold[token]
						if @isArray(hold)
							Array.prototype.splice.call hold, token, 1
						else
							delete hold[token]
						data = removed.item
						return data
					if not hold[token]?
						return data
					hold = hold[token]
		get: (data, path) ->
			out = data
			tokens = @tokenize path

			for token in tokens
				if @isObject(out) or (out and @isArray(out)) and out[token]?
					out = out[token]
				else
					return null
			out
		extract: (data, path) ->
			if not new RegExp('[{\[]').test path
				@get(data, path) || []
			tokens = @tokenize path
			out = []
			context = set: [data]

			for token in tokens
				got = []
				for item in context.set
					for own key, value of item
						if @matchToken key, token
							got.push value
				context.set = got
			got
		expand: (flat) ->
			out = {}
			if (flat.constructor isnt Array)
				flat = [flat]
			for set in flat
				for own path, value of set
					tokens = @tokenize(path).reverse()
					value = set[path]
					if tokens[0] is '{n}' or not isNaN Number tokens[0]
						(child = [])[tokens[0]] = value;
					else
						(child = {})[tokens[0]] = value;
					tokens.shift()
					for token in tokens
						if not isNaN Number token
							(parent = [])[parseInt(token, 10)] = child
						else
							(parent = {})[token] = child
						child = parent
					@merge(out, child)
			out
		flatten: (data, separator = '.', depthLimit = false) ->
			data = @merge {}, data
			path = ''
			stack = []
			out = {}

			while (@keys(data).length)
				if @isArray(data) and data.length > 0
					key = data.length - 1
					el = data.pop()
				else
					key = @keys(data)[0]
					el = data[key]
					delete data[key]
				if not el? or path.split(separator).length is depthLimit or typeof el isnt 'object' or el.nodeType or (typeof el is 'object' and (el.constructor is Date or el.constructor is RegExp or el.constructor is Function)) or el.constructor isnt Object
					out[path + key] = el
				else
					if @keys(data).length > 0
						stack.push [data, path]
					data = el
					path += key + separator
				if (@keys(data).length is 0 and stack.length > 0)
					curr = stack.pop()
					[data, path] = curr
			out
		merge: if Object.assign then Object.assign else (objects...) ->
			out = objects.shift()
			for object in objects
				for own key, value of object
					if out[key] and value and (@isObject(out[key]) and @isObject(value) or @isArray(out[key]))
						out[key] = @merge out[key], value
					else
						out[key] = value
			out
		matchToken: (key, token) ->
			if token is '{n}'
				return parseInt(key, 10) % 1 is 0
			if token is '{s}'
				return typeof key is 'string'
			if parseInt(token, 10) % 1 is 0
				return parseInt(key, 10) is parseInt(token, 10)
			return key is token
		dotToBracketNotation: (path, reverse = false) ->
			if not path
				throw new TypeError 'Not Enough Arguments'
			if reverse
				path.replace(/\]/g, '').split('[').join('.')
			else
				path.replace(/([\w]+)\.?/g, '[$1]').replace(/^\[(\w+)\]/, '$1')
		tokenize: (path) ->
			if path.indexOf('[') is -1
				path.split '.'
			else
				@map path.split('['), (v) ->
					v = v.replace /\]/, ''
					if v is '' then '{n}' else v
		isObject: (item) ->
			return typeof item is 'object' and Object.prototype.toString.call(item) is '[object Object]'
		isArray: if Array.isArray then Array.isArray else (item) ->
			return typeof item is 'object' and typeof item.length is 'number' and Object.prototype.toString.call(item) is '[object Array]'
		keys: if Object.keys then Object.keys else (object) ->
			keys = []
			if @isObject object
				for own key of object
					keys.push key
			else if @isArray(object)
				for key in object
					keys.push _i
			keys

		Hash = new Hash()
, this)