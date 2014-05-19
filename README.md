DigitalOceanCLI
===============

A simple command line utility for working with Digital Ocean Droplets

##Install

To install simply use

<pre><code>npm install digitaloceancli -g</code></pre>

##Setup

To use the tool you will need to setup the API, to do this go into your account and get a API key and Client ID from the API tab. Then simply run:

<pre><code>digitalocean</code></pre>

##Commands

There is a number of commands in progress for the Digital Ocean CLI, so far we have the following functionality

###New Droplet
To create a new droplet run the command

<pre><code>digitalocean --new</code></pre>

You will then be asked a series of questions about your droplet

###Add SSH Key
To create a new ssh key run the command

<pre><code>digitalocean --addkey</code></pre>

You will then be asked to name your key and to select the key you want to upload, the tool will look in your user home directory .ssh folder for keys.

##Licence

Copyright (c) 2014 Jonathan Fielding

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
