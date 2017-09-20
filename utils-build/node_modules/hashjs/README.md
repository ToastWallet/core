#hash-js

[![Build Status](https://travis-ci.org/jbielick/hash-js.svg)](https://travis-ci.org/jbielick/hash-js)
[![Coverage Status](https://img.shields.io/coveralls/jbielick/hash-js.svg)](https://coveralls.io/r/jbielick/hash-js)

A library of functions for javascript object traversal, manipulation and extraction. Safely access, extract, rearrange and transform deeply nested objects and structures.

This is not xpath for javascript. It's simple, focused on combining, extracting, inserting, and translating data paths in javascript objects.

####Where to start

include hash.min.js or hash.js on your page.

Install as a node module with npm:

    npm install hashjs


####Usage
```

var flatPathsAndKeys = {
	'User.Post.Tag.0.name': 'Fishing',
	'User.Post.Tag.1.name': 'Selfies',
};

H.expand(flatPathsAndKeys);

// returns:

{
	User: {
		Post: {
			Tag: [{
				name: 'News'
			},{
				name: 'Selfies'
			}]
		}
	}
}
```

Conversely:

```
var multiDimensional = {
	User: {
		Post: {
			Tag: [{
				Name: 'News'
			},{
				name: 'Selfies'
			}]
		}
	}
};

H.flatten(multiDimensional);

// returns

{
	'User.Post.Tag.0.name': 'Fishing',
	'User.Post.Tag.1.name': 'Selfies',
}

```

Also works with `[]` like in form input elements!

####Examples:
Let's say you have input elements on your page like so:

    <input id="UserPostTag0Name" name="data[User][Post][Tag][][name]" value="Fishing" type="text">
    <input id="UserPostTag1Name" name="data[User][Post][Tag][][name]" value="Selfies" type="text">

We're probably looking at a `User` model that has many `Post` which hasBelongsToMany `Tag`s.
Here's where the user would input the name of new `Tag`s to associate with their `Post`:

Javascrit doesn't understand the form-encoded syntax for representing multidimensional input structures.
The previous input element would yield a structure like the following in PHP or the like:

```php
array(
	'User' => array(
		'Post' => array(
			'Tag' => array(
				0 => array(
					'name' => 'News'
				),
				1 => array(
					'name' => 'Selfies'
				)
			)
		)
	)
)
```
That's really helpful. Thanks, PHP.
Want this structure in javascript?

```javascript
var input0 = document.getElementById('UserPostTag0Name');
var input1 = document.getElementById('UserPostTag1Name');
var flatPathsAndKeys = {};

flatPathsAndKeys[input0.name] = input0.value;
flatPathsAndKeys[input1.name] = input1.value;

// H.expand() will create a multi-dimensional object out of path: value pairs.
// flatPathsAndKeys looks like:
//
// {
// 	'data[User][Post][Tag][][name]': 'Fishing',
// 	'data[User][Post][Tag][][name]': 'Selfies',
// }

```