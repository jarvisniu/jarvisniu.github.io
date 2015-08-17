Quick install guide
===================

##### Source: <https://docs.djangoproject.com/en/1.7/intro/install/#verifying>

Before you can use Django, you’ll need to get it installed. We have a [complete installation guide](https://docs.djangoproject.com/en/1.7/topics/install/) that covers all the possibilities; this guide will guide you to a simple, minimal installation that’ll work while you walk through the introduction.

Install Python
--------------

Being a Python Web framework, Django requires Python. It works with Python 2.7, 3.2, 3.3, or 3.4. All these versions of Python include a lightweight database called [SQLite](http://sqlite.org/) so you won’t need to set up a database just yet.

Get the latest version of Python at <http://www.python.org/download/> or with your operating system’s package manager.

>### Django on Jython

> If you use Jython (a Python implementation for the Java platform), you’ll need to follow a few additional steps. See Running Django on Jython for details.

You can verify that Python is installed by typing python from your shell; you should see something like:

    Python 3.3.3 (default, Nov 26 2013, 13:33:18)
    [GCC 4.8.2] on linux
    Type "help", "copyright", "credits" or "license" for more information.
    >>>

----

## Set up a database

This step is only necessary if you’d like to work with a “large” database engine like PostgreSQL, MySQL, or Oracle. To install such a database, consult the [database installation information](https://docs.djangoproject.com/en/1.7/topics/install/#database-installation).

----

## Remove any old versions of Django

If you are upgrading your installation of Django from a previous version, you will need to [uninstall the old Django version before installing the new version](https://docs.djangoproject.com/en/1.7/topics/install/#removing-old-versions-of-django).

----

## Install Django
You’ve got three easy options to install Django:

- Install a version of Django [provided by your operating system distribution](https://docs.djangoproject.com/en/1.7/misc/distributions/). This is the quickest option for those who have operating systems that distribute Django.
- [Install an official release](https://docs.djangoproject.com/en/1.7/topics/install/#installing-official-release). This is the best approach for users who want a stable version number and aren’t concerned about running a slightly older version of Django.
- [Install the latest development version](https://docs.djangoproject.com/en/1.7/topics/install/#installing-development-version). This is best for users who want the latest-and-greatest features and aren’t afraid of running brand-new code.


> ### Always refer to the documentation that corresponds to the version of Django you’re using!

> If you do either of the first two steps, keep an eye out for parts of the documentation marked new in development version. That phrase flags features that are only available in development versions of Django, and they likely won’t work with an official release.

----

## Verifying

To verify that Django can be seen by Python, type python from your shell. Then at the Python prompt, try to import Django:

    >>> import django
    >>> print(django.get_version())
    1.7

You may have another version of Django installed.

----

## That’s it!

That’s it – you can now [move onto the tutorial](https://docs.djangoproject.com/en/1.7/intro/tutorial01/).

---

## Table

| First Header78787878  | Second Header              |
| --------------| ---------------------------|
| Content Cell  | Content Cell               |
| Content Cell  | Content Cell  |

I **like** that x^4  ~~strikethrough~~
<http://www.qq.com>.

<http://github.com>

- [x] @mentions, #refs, [links](), **formatting**, and <del>tags</del> are supported
- [x] list syntax is required (any unordered or ordered list supported)
- [x] this is a complete item
- [ ] @mentions, #refs,this is an incomplete item GH-26